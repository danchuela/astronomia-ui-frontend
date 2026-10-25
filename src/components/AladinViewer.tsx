import { useEffect, useRef, useState, useCallback } from "react";
import { useLang } from "@/lib/i18n";
import type { AladinCoordinates, ViewSnapshot } from "@/types/chat";
import { reuseCapture, reuseHiddenCapture, sameView } from "@/lib/viewerSnapshot";

const SURVEY_GROUPS = [
  {
    band: "xray",
    surveys: [
      { label: "XMM", hipsId: "xcatdb/P/XMM/PN/color" },
      { label: "RASS", hipsId: "CDS/P/RASS" },
    ],
  },
  {
    band: "uv",
    surveys: [
      { label: "GALEX FUV", hipsId: "CDS/P/GALEXGR6_7/FUV" },
      { label: "GALEX NUV", hipsId: "CDS/P/GALEXGR6_7/NUV" },
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
}

export function AladinViewer({ coordinates, objectName, onViewerReady, height = 400 }: AladinViewerProps) {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aladinRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      },
    };
  }, []);

  const captureCanvasImage = useCallback(async (): Promise<string | undefined> => {
    const container = containerRef.current;
    const canvas = container?.querySelector<HTMLCanvasElement>(".aladin-imageCanvas");
    if (!container || !canvas || canvas.width <= 0 || canvas.height <= 0) return undefined;
    if (aladinRef.current?.getBaseImageLayer()?.id !== activeSurveyRef.current) return undefined;
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
  }, []);

  const getSnapshot = useCallback(async (): Promise<ViewSnapshot | null> => {
    if (containerRef.current?.offsetParent === null && aladinRef.current) {
      const [ra, dec] = aladinRef.current.getRaDec();
      return reuseHiddenCapture(lastGoodSnapshotRef.current, ra, dec, activeSurveyRef.current, aladinRef.current.getRotation());
    }
    const state = readViewerState();
    if (!state) return null;

    try {
      const image_data = await captureCanvasImage();
      if (image_data && sameView(state, readViewerState())) {
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
  }, [captureCanvasImage, readViewerState]);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    let captureTimer: ReturnType<typeof setInterval> | undefined;
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
          survey: activeSurveyRef.current,
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
        // Keep a recent coherent capture while visible, also after panning or zooming.
        captureTimer = setInterval(() => {
          if (containerRef.current?.offsetParent !== null) void getSnapshot();
        }, 1000);
        setLoading(false);
        if (onViewerReady) {
          onViewerReady(getSnapshot);
        }
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
      aladinRef.current = null;
    };
  }, [target, fovDeg, getSnapshot, onViewerReady]);

  const handleSurveyChange = useCallback((hipsId: string) => {
    activeSurveyRef.current = hipsId;
    lastGoodSnapshotRef.current = null;
    setActiveSurvey(hipsId);
    if (aladinRef.current) {
      aladinRef.current.setBaseImageLayer(hipsId);
    }
  }, []);

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

      <div className="relative rounded-lg overflow-hidden border border-border">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/60 z-10">
            <span className="text-sm text-muted-foreground animate-pulse">
              {t.loadingViewer}
            </span>
          </div>
        )}
        <div ref={containerRef} style={{ width: "100%", height: `${height}px` }} />
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
