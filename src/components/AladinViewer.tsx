import { useEffect, useRef, useState, useCallback } from "react";
import { useLang } from "@/lib/i18n";
import { WaitingTips } from "@/components/WaitingTips";
import type { AladinCoordinates, ViewSnapshot } from "@/types/chat";
import { reuseCapture, reuseHiddenCapture, sameView } from "@/lib/viewerSnapshot";
import { fetchHipsMetadata, HipsTileTracker, tileFormat, visibleTileUrls, type HipsMetadata } from "@/lib/hips";
import { RotateCw } from "lucide-react";
import type { AladinInstance, AladinStatic } from "aladin-lite";

const SURVEY_GROUPS = [
  {
    band: "xray",
    surveys: [
      { label: "XMM", hipsId: "ESDC/P/XMM/EPIC-RGB" },
      { label: "RASS", hipsId: "CDS/P/RASS" },
      { label: "eROSITA", hipsId: "erosita/dr1/rate/rgb" },
    ],
  },
  {
    band: "uv",
    surveys: [
      { label: "GALEX FUV", hipsId: "CDS/P/GALEXGR6/AIS/FUV" },
      { label: "GALEX NUV", hipsId: "CDS/P/GALEXGR6/AIS/NUV" },
    ],
  },
  {
    band: "optical",
    surveys: [
      { label: "DSS2", hipsId: "CDS/P/DSS2/color" },
      { label: "SDSS", hipsId: "CDS/P/SDSS9/color" },
      { label: "PanSTARRS", hipsId: "CDS/P/PanSTARRS/DR1/color-i-r-g" },
      { label: "DECaLS", hipsId: "CDS/P/DECaLS/DR5/color" },
    ],
  },
  {
    band: "ir",
    surveys: [
      { label: "2MASS", hipsId: "CDS/P/2MASS/color" },
      { label: "WISE", hipsId: "CDS/P/allWISE/color" },
    ],
  },
  {
    band: "radio",
    surveys: [
      { label: "NVSS", hipsId: "CDS/P/NVSS" },
    ],
  },
] as const;

const DEFAULT_SURVEY = "CDS/P/DSS2/color";
const DEFAULT_FOV_DEG = 0.5;

interface AladinViewerProps {
  coordinates?: AladinCoordinates;
  height?: number;
  objectName?: string;
  onViewerReady?: (getSnapshot: () => Promise<ViewSnapshot | null>) => void;
  visible?: boolean;
}

export function AladinViewer({ coordinates, objectName, onViewerReady, height = 400, visible = true }: AladinViewerProps) {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);
  useEffect(() => { visibleRef.current = visible; }, [visible]);
  const aladinRef = useRef<AladinInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyFailure, setSurveyFailure] = useState<'failed' | 'no_coverage' | null>(null);
  const metadataRef = useRef<HipsMetadata | null>(null);
  const sourceRootRef = useRef('');
  const trackerRef = useRef<HipsTileTracker | null>(null);
  const loadAbortRef = useRef<AbortController | null>(null);
  const loadGenerationRef = useRef(0);
  const moduleRef = useRef<AladinStatic | null>(null);
  const [activeSurvey, setActiveSurvey] = useState<string>(
    coordinates?.hips_id ?? DEFAULT_SURVEY
  );
  const activeSurveyRef = useRef(activeSurvey);
  const lastGoodSnapshotRef = useRef<ViewSnapshot | null>(null);
  const [displayState, setDisplayState] = useState<ViewSnapshot | null>(null);
  useEffect(() => { activeSurveyRef.current = activeSurvey; }, [activeSurvey]);

  const target = coordinates
    ? `${coordinates.ra_deg} ${coordinates.dec_deg}`
    : objectName ?? "";
  const fovDeg = coordinates ? coordinates.size_arcmin / 60 : DEFAULT_FOV_DEG;

  const readViewerState = useCallback((): Omit<ViewSnapshot, "image_data"> | null => {
    if (!aladinRef.current) return null;
    const [ra, dec] = aladinRef.current.getRaDec();
    const [fovX, fovY] = aladinRef.current.getFov();
    const canvas = containerRef.current?.querySelector<HTMLCanvasElement>(".aladin-imageCanvas");
    if (!canvas || ![ra, dec, fovX, fovY].every(Number.isFinite) || fovX <= 0 || fovY <= 0) return null;
    return {
      ra_deg: ra,
      dec_deg: dec,
      size_arcmin: fovX * 60,
      hips_id: activeSurveyRef.current,
      view_metadata: {
        ra_deg: ra, dec_deg: dec, hips_id: activeSurveyRef.current,
        fov_x_deg: fovX, fov_y_deg: fovY,
        width_px: canvas.width, height_px: canvas.height,
        rotation_deg: aladinRef.current.getRotation(), projection: "SIN",
        hips_service_url: sourceRootRef.current || undefined,
        hips_release_date: metadataRef.current?.release,
        hips_revision: metadataRef.current?.revision,
      },
    };
  }, []);

  const loadState = useCallback(() => {
    const viewer = aladinRef.current, metadata = metadataRef.current;
    if (!viewer || !metadata || viewer.getBaseImageLayer()?.id !== activeSurveyRef.current) return 'loading';
    try {
      return trackerRef.current?.state(visibleTileUrls(viewer.wasm, metadata, sourceRootRef.current)) ?? 'loading';
    } catch { return 'loading'; }
  }, []);

  const probeMissingTiles = useCallback(() => {
    const viewer = aladinRef.current, metadata = metadataRef.current;
    if (!viewer || !metadata || viewer.getBaseImageLayer()?.id !== activeSurveyRef.current) return;
    try {
      trackerRef.current?.probeMissing(visibleTileUrls(viewer.wasm, metadata, sourceRootRef.current));
    } catch { /* the engine is not ready yet */ }
  }, []);

  const imageReady = useCallback(() => loadState() === 'ready'
    && !aladinRef.current?.wasm.isRendering(), [loadState]);

  const loadSurvey = useCallback(async (id: string) => {
    const viewer = aladinRef.current;
    if (!viewer || !moduleRef.current) return;
    loadAbortRef.current?.abort();
    trackerRef.current?.dispose();
    const controller = new AbortController();
    loadAbortRef.current = controller;
    loadGenerationRef.current += 1;
    lastGoodSnapshotRef.current = null;
    metadataRef.current = null;
    sourceRootRef.current = '';
    trackerRef.current = null;
    setLoading(true);
    setSurveyFailure(null);
    setDisplayState(null);
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const base = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');
      const metadata = await fetchHipsMetadata(base, id, controller.signal);
      if (controller.signal.aborted || aladinRef.current !== viewer || activeSurveyRef.current !== id) return;
      const root = base + metadata.path;
      metadataRef.current = metadata;
      sourceRootRef.current = root;
      const tracker = new HipsTileTracker(root);
      trackerRef.current = tracker;
      for (const entry of performance.getEntriesByType('resource')) tracker.observe(entry as PerformanceResourceTiming);
      const layer = moduleRef.current.HiPS(id, {
        name: id, url: root, creatorDid: `ivo://${id}`, imgFormat: tileFormat(metadata),
      });
      let abortLayer: () => void = () => {};
      try {
        await Promise.race([layer.query, new Promise<never>((_, reject) => {
          abortLayer = () => reject(new DOMException('Survey load aborted', 'AbortError'));
          controller.signal.addEventListener('abort', abortLayer, { once: true });
        })]);
      } finally { controller.signal.removeEventListener('abort', abortLayer); }
      if (controller.signal.aborted || aladinRef.current !== viewer) return;
      viewer.setBaseImageLayer(layer);
    } catch (err) {
      if (loadAbortRef.current === controller && aladinRef.current === viewer) {
        console.warn('[AladinViewer] survey load failed', err);
        setSurveyFailure('failed');
        setLoading(false);
      }
    } finally { clearTimeout(timer); }
  }, []);

  const captureCanvasImage = useCallback(async (): Promise<string | undefined> => {
    const container = containerRef.current;
    const canvas = container?.querySelector<HTMLCanvasElement>(".aladin-imageCanvas");
    if (!visibleRef.current || !imageReady() || !container || !canvas || canvas.width <= 0 || canvas.height <= 0) return undefined;
    if (!imageReady() || aladinRef.current?.getBaseImageLayer()?.id !== activeSurveyRef.current) return undefined;
    if (container.offsetParent === null || canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {
      return undefined;
    }

    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    if (container.offsetParent === null || canvas.width <= 0 || canvas.height <= 0) {
      return undefined;
    }
    if (aladinRef.current?.getBaseImageLayer()?.id !== activeSurveyRef.current) return undefined;

    // Capture only the image plane, never reticles, catalogues or viewer controls.
    // Preserve the entire rectangular field and avoid another lossy JPEG encoding.
    return canvas.toDataURL("image/png");
  }, [imageReady]);

  const getSnapshot = useCallback(async (): Promise<ViewSnapshot | null> => {
    if ((!visibleRef.current || containerRef.current?.offsetParent === null) && aladinRef.current) {
      const [ra, dec] = aladinRef.current.getRaDec();
      return reuseHiddenCapture(lastGoodSnapshotRef.current, ra, dec, activeSurveyRef.current, aladinRef.current.getRotation());
    }
    const state = readViewerState();
    if (!state) return null;

    try {
      const image_data = await captureCanvasImage();
      if (image_data && imageReady() && sameView(state, readViewerState())) {
        const snapshot = { ...state, image_data };
        lastGoodSnapshotRef.current = snapshot;
        setDisplayState(current => sameView(current, state) ? current : state);
        return snapshot;
      }
    } catch {
      // Canvas tainted by CORS or temporarily unavailable; fall back below.
    }

    const current = readViewerState();
    return current ? reuseCapture(lastGoodSnapshotRef.current, current)
      : { ...state, view_metadata: { ...state.view_metadata!, capture_required: true } };
  }, [captureCanvasImage, imageReady, readViewerState]);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    let captureTimer: ReturnType<typeof setInterval> | undefined;
    let observer: PerformanceObserver | undefined;
    lastGoodSnapshotRef.current = null;
    setDisplayState(null);

    async function init() {
      if (!containerRef.current) return;
      try {
        const mod = await import("aladin-lite");
        const A = mod.default;
        await A.init;

        if (cancelled || !containerRef.current) return;

        const aladin = A.aladin(containerRef.current, {
          log: false,
          survey: [],
          fov: fovDeg,
          target,
          projection: "SIN",
          showReticle: true,
          showZoomControl: true,
          showFov: false,
          showLayersControl: false,
          showGotoControl: false,
          showFrame: false,
          cooFrame: "J2000",
        });

        aladinRef.current = aladin;
        moduleRef.current = A;
        observer = new PerformanceObserver(entries => {
          for (const entry of entries.getEntries()) trackerRef.current?.observe(entry as PerformanceResourceTiming);
        });
        observer.observe({ type: 'resource', buffered: true });
        let frame = '', waitingSince = Date.now(), lastCapture = 0;
        // Keep a recent coherent capture while visible, also after panning or zooming.
        captureTimer = setInterval(() => {
          if (cancelled || !visibleRef.current || containerRef.current?.offsetParent === null || !metadataRef.current) return;
          const state = readViewerState();
          const nextFrame = `${loadGenerationRef.current}:${JSON.stringify(state)}`;
          if (frame !== nextFrame) { frame = nextFrame; waitingSince = Date.now(); }
          const status = loadState();
          if (status === 'failed' || status === 'no_coverage' || (status !== 'ready' && Date.now() - waitingSince > 25000)) {
            setSurveyFailure(status === 'no_coverage' ? status : 'failed');
            setLoading(false);
          } else if (imageReady()) {
            setSurveyFailure(null);
            setLoading(false);
            if (Date.now() - lastCapture > 1000) { lastCapture = Date.now(); void getSnapshot(); }
          } else {
            setLoading(true);
            if (Date.now() - waitingSince > 4000) probeMissingTiles();
          }
        }, 250);
        if (onViewerReady) {
          onViewerReady(getSnapshot);
        }
        void loadSurvey(activeSurveyRef.current);
      } catch (err) {
        if (!cancelled) {
          console.error("[AladinViewer] init failed:", err);
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      clearInterval(captureTimer);
      observer?.disconnect();
      loadAbortRef.current?.abort();
      trackerRef.current?.dispose();
      trackerRef.current = null;
      metadataRef.current = null;
      sourceRootRef.current = '';
      aladinRef.current = null;
    };
  }, [target, fovDeg, getSnapshot, imageReady, loadState, loadSurvey, onViewerReady, probeMissingTiles, readViewerState]);

  const handleSurveyChange = useCallback((hipsId: string) => {
    activeSurveyRef.current = hipsId;
    lastGoodSnapshotRef.current = null;
    setActiveSurvey(hipsId);
    void loadSurvey(hipsId);
  }, [loadSurvey]);

  if (error) {
    const isWebGL = error.toLowerCase().includes("webgl");
    return (
      <div className="mt-3 p-3 rounded-lg bg-muted/40 text-muted-foreground text-xs space-y-1">
        <p>{t.viewerUnavailable}: {error}</p>
        {isWebGL && (
          <p>
            {t.webglHint}
          </p>
        )}
        <a
          href={`https://aladin.cds.unistra.fr/AladinLite/?target=${encodeURIComponent(target)}&fov=${fovDeg.toFixed(4)}&survey=${encodeURIComponent(activeSurvey)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-primary underline"
        >
          {t.openAladin}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-1 mb-2">
        {SURVEY_GROUPS.map((group) => (
          <div key={group.band} className="grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-1.5">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider w-16 shrink-0 text-right">
              {t.bands[group.band]}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {group.surveys.map((s) => (
              <button
                key={s.hipsId}
                onClick={() => handleSurveyChange(s.hipsId)}
                className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${
                  activeSurvey === s.hipsId
                    ? "bg-primary/30 border-primary text-primary-foreground"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {s.label}
              </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {surveyFailure && (
        <div role="status" className="mb-2 flex items-center justify-between gap-2 text-xs text-amber-300">
          <span>{surveyFailure === 'no_coverage' ? t.surveyNoCoverage : t.surveyUnavailable}</span>
          <button type="button" title={t.retrySurvey} aria-label={t.retrySurvey}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded border border-border hover:bg-muted"
            onClick={() => void loadSurvey(activeSurveyRef.current)}><RotateCw size={15} /></button>
        </div>
      )}
      <div data-viewer-state={surveyFailure ?? (loading ? 'loading' : 'ready')} className="relative rounded-lg overflow-hidden border border-border">
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-muted/60 z-10 px-4">
            <span className="text-sm text-muted-foreground animate-pulse">
              {t.loadingViewer}
            </span>
            <WaitingTips compact />
          </div>
        )}
        <div ref={containerRef} style={{ width: "100%", height: `${height}px`, opacity: surveyFailure ? 0 : 1 }} />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {displayState ? (
          <>
            <span>RA: {displayState.ra_deg.toFixed(4)}</span>
            <span>Dec: {displayState.dec_deg.toFixed(4)}</span>
            <span>FoV: {displayState.size_arcmin.toFixed(1)}&apos; x {((displayState.view_metadata?.fov_y_deg ?? 0) * 60).toFixed(1)}&apos;</span>
          </>
        ) : coordinates ? (
          <>
            <span>RA: {coordinates.ra_deg.toFixed(4)}</span>
            <span>Dec: {coordinates.dec_deg.toFixed(4)}</span>
            <span>FoV: {coordinates.size_arcmin}&apos;</span>
          </>
        ) : objectName ? (
          <span>{objectName}</span>
        ) : null}
      </div>
    </div>
  );
}
