import { useEffect, useRef, useState, useCallback } from "react";
import type { AladinCoordinates, ViewSnapshot } from "@/types/chat";

const SURVEY_GROUPS = [
  {
    band: "Rayos X",
    surveys: [
      { label: "XMM", hipsId: "xcatdb/P/XMM/PN/color" },
      { label: "RASS", hipsId: "CDS/P/RASS" },
    ],
  },
  {
    band: "UV",
    surveys: [
      { label: "GALEX FUV", hipsId: "CDS/P/GALEXGR6_7/FUV" },
      { label: "GALEX NUV", hipsId: "CDS/P/GALEXGR6_7/NUV" },
    ],
  },
  {
    band: "Óptico",
    surveys: [
      { label: "DSS2", hipsId: "CDS/P/DSS2/color" },
      { label: "SDSS", hipsId: "CDS/P/SDSS9/color" },
      { label: "PanSTARRS", hipsId: "CDS/P/PanSTARRS/DR1/color-i-r-g" },
      { label: "DECaLS", hipsId: "CDS/P/DECaLS/DR5/color" },
    ],
  },
  {
    band: "IR",
    surveys: [
      { label: "2MASS", hipsId: "CDS/P/2MASS/color" },
      { label: "WISE", hipsId: "CDS/P/allWISE/color" },
    ],
  },
  {
    band: "Radio",
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
  useEffect(() => { activeSurveyRef.current = activeSurvey; }, [activeSurvey]);

  const target = coordinates
    ? `${coordinates.ra_deg} ${coordinates.dec_deg}`
    : objectName ?? "";
  const fovDeg = coordinates ? coordinates.size_arcmin / 60 : DEFAULT_FOV_DEG;

  const readViewerState = useCallback((): Omit<ViewSnapshot, "image_data"> | null => {
    if (!aladinRef.current) return null;
    const [ra, dec] = aladinRef.current.getRaDec();
    const [fovX] = aladinRef.current.getFov();
    return {
      ra_deg: ra,
      dec_deg: dec,
      size_arcmin: fovX * 60,
      hips_id: activeSurveyRef.current,
    };
  }, []);

  const captureCanvasImage = useCallback(async (): Promise<string | undefined> => {
    const container = containerRef.current;
    const canvas = container?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!container || !canvas || canvas.width <= 0 || canvas.height <= 0) return undefined;
    if (container.offsetParent === null || canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {
      return undefined;
    }

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    if (container.offsetParent === null || canvas.width <= 0 || canvas.height <= 0) {
      return undefined;
    }

    const size = Math.min(canvas.width, canvas.height);
    if (size <= 0) return undefined;

    const crop = document.createElement("canvas");
    crop.width = size;
    crop.height = size;
    const ctx = crop.getContext("2d");
    if (!ctx) return canvas.toDataURL("image/jpeg", 0.85);

    ctx.drawImage(
      canvas,
      (canvas.width - size) / 2,
      (canvas.height - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size
    );
    return crop.toDataURL("image/jpeg", 0.85);
  }, []);

  const getSnapshot = useCallback(async (): Promise<ViewSnapshot | null> => {
    const state = readViewerState();
    if (!state) return null;

    try {
      const image_data = await captureCanvasImage();
      if (image_data) {
        const snapshot = { ...state, image_data };
        lastGoodSnapshotRef.current = snapshot;
        return snapshot;
      }
    } catch {
      // Canvas tainted by CORS or temporarily unavailable; fall back below.
    }

    const cached = lastGoodSnapshotRef.current;
    if (cached?.image_data && cached.hips_id === state.hips_id) {
      return { ...state, image_data: cached.image_data };
    }

    return state;
  }, [captureCanvasImage, readViewerState]);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    lastGoodSnapshotRef.current = null;

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
          showLayersControl: false,
          showGotoControl: false,
          showFrame: false,
          cooFrame: "J2000",
        });

        aladinRef.current = aladin;
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
        <p>Visor interactivo no disponible: {error}</p>
        {isWebGL && (
          <p>
            Activa hardware acceleration en tu navegador (Chrome: chrome://settings/system) y recarga.
          </p>
        )}
        <a
          href={`https://aladin.cds.unistra.fr/AladinLite/?target=${encodeURIComponent(target)}&fov=${fovDeg.toFixed(4)}&survey=${encodeURIComponent(activeSurvey)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-primary underline"
        >
          Abrir en Aladin Lite web
        </a>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-1 mb-2">
        {SURVEY_GROUPS.map((group) => (
          <div key={group.band} className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider w-16 shrink-0 text-right">
              {group.band}
            </span>
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
        ))}
      </div>

      <div className="relative rounded-lg overflow-hidden border border-border">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/60 z-10">
            <span className="text-sm text-muted-foreground animate-pulse">
              Cargando visor interactivo...
            </span>
          </div>
        )}
        <div ref={containerRef} style={{ width: "100%", height: `${height}px` }} />
      </div>

      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
        {coordinates ? (
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
