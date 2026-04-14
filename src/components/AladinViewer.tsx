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
  useEffect(() => { activeSurveyRef.current = activeSurvey; }, [activeSurvey]);

  const target = coordinates
    ? `${coordinates.ra_deg} ${coordinates.dec_deg}`
    : objectName ?? "";
  const fovDeg = coordinates ? coordinates.size_arcmin / 60 : DEFAULT_FOV_DEG;

  useEffect(() => {
    if (!target) return;
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      try {
        const mod = await import("aladin-lite");
        const A = mod.default;
        await A.init;

        if (cancelled || !containerRef.current) return;

        const aladin = A.aladin(containerRef.current, {
          survey: activeSurvey,
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
          onViewerReady(async () => {
            if (!aladinRef.current) return null;
            const [ra, dec] = aladinRef.current.getRaDec();
            const [fovX] = aladinRef.current.getFov();
            let image_data: string | undefined;
            try {
              // Wait for the next animation frame so WebGL has a populated buffer
              await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
              const canvas = containerRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
              if (canvas) {
                // Crop a centered square so the analysis image has a consistent aspect ratio
                const size = Math.min(canvas.width, canvas.height);
                const crop = document.createElement("canvas");
                crop.width = size;
                crop.height = size;
                const ctx = crop.getContext("2d");
                if (ctx) {
                  ctx.drawImage(canvas, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size, 0, 0, size, size);
                  image_data = crop.toDataURL("image/jpeg", 0.85);
                } else {
                  image_data = canvas.toDataURL("image/jpeg", 0.85);
                }
              }
            } catch {
              // Canvas tainted by CORS — capture not available
            }
            return { ra_deg: ra, dec_deg: dec, size_arcmin: fovX * 60, hips_id: activeSurveyRef.current, image_data };
          });
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
    // Only re-init when target/fov change, not activeSurvey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, fovDeg]);

  const handleSurveyChange = useCallback((hipsId: string) => {
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
