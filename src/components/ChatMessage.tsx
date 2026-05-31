import { useEffect, useMemo, useState } from "react";
import type { HstJwstInfo, Message, ObjectInfo } from "@/types/chat";
import { sendFeedback } from "@/lib/api";

const OBSERVATION_FRAME_MIN_HEIGHT = 420;
const OBSERVATION_FRAME_HEIGHT_EVENT = "astronomia-observation-frame-height";

function withAutoHeightScript(html: string, frameId: string) {
  const script = `
<script>
(() => {
  const frameId = ${JSON.stringify(frameId)};
  const sendHeight = () => {
    const body = document.body;
    const doc = document.documentElement;
    const height = Math.max(
      body ? body.scrollHeight : 0,
      doc ? doc.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      doc ? doc.offsetHeight : 0
    );
    window.parent.postMessage({ type: "${OBSERVATION_FRAME_HEIGHT_EVENT}", frameId, height }, "*");
  };

  window.addEventListener("load", () => {
    sendHeight();
    setTimeout(sendHeight, 150);
    setTimeout(sendHeight, 600);
    setTimeout(sendHeight, 1200);
  });
  document.addEventListener("DOMContentLoaded", sendHeight);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);
  }
})();
</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${script}</body>`);
  }
  return `${html}${script}`;
}

function ObservationHtmlFrame({ html }: { html: string }) {
  const frameId = useMemo(
    () => `observation-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    []
  );
  const [height, setHeight] = useState(OBSERVATION_FRAME_MIN_HEIGHT);
  const srcDoc = useMemo(() => withAutoHeightScript(html, frameId), [html, frameId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; frameId?: string; height?: number };
      if (
        data?.type !== OBSERVATION_FRAME_HEIGHT_EVENT ||
        data.frameId !== frameId ||
        typeof data.height !== "number"
      ) {
        return;
      }

      const nextHeight = Math.max(
        OBSERVATION_FRAME_MIN_HEIGHT,
        Math.ceil(data.height)
      );
      setHeight((current) => (Math.abs(current - nextHeight) > 4 ? nextHeight : current));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameId]);

  return (
    <iframe
      srcDoc={srcDoc}
      className="mt-3 block w-full border-0 bg-transparent"
      style={{ height: `${height}px` }}
      sandbox="allow-scripts"
      scrolling="no"
    />
  );
}

// Mini-rating con dos botones (pulgar arriba/abajo) que envia un feedback
// rapido al BFF en cuanto el usuario hace click. Aparece solo en mensajes
// del bot que ya tienen requestId asignado.
function MiniRating({ requestId }: { requestId: string }) {
  const [submitted, setSubmitted] = useState<"up" | "down" | null>(null);
  const [error, setError] = useState(false);

  async function rate(rating: "up" | "down") {
    if (submitted) return;
    try {
      await sendFeedback({ request_id: requestId, rating });
      setSubmitted(rating);
    } catch {
      setError(true);
    }
  }

  if (submitted) {
    return (
      <div className="mt-2 text-xs text-muted-foreground italic">
        Gracias por tu feedback {submitted === "up" ? "👍" : "👎"}
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-xs text-muted-foreground">¿Te ha sido util?</span>
      <button
        type="button"
        onClick={() => rate("up")}
        aria-label="Marcar como util"
        className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs hover:bg-muted/60 hover:border-primary/60 transition-colors"
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => rate("down")}
        aria-label="Marcar como no util"
        className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs hover:bg-muted/60 hover:border-primary/60 transition-colors"
      >
        👎
      </button>
      {error && (
        <span className="text-[11px] text-red-400">
          No se pudo enviar, intentalo mas tarde.
        </span>
      )}
    </div>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function ObjectInfoBar({ info }: { info: ObjectInfo }) {
  const items: string[] = [];
  if (info.otype_long || info.otype) items.push(info.otype_long ?? info.otype ?? "");
  if (info.morph_type) items.push(info.morph_type);
  if (info.rvz_radvel != null) items.push(`v = ${info.rvz_radvel.toFixed(0)} km/s`);
  if (info.rvz_redshift != null) items.push(`z = ${info.rvz_redshift.toFixed(6)}`);
  if (info.sp_type) items.push(info.sp_type);
  if (items.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="px-2 py-0.5 text-xs rounded-md bg-muted/40 text-muted-foreground border border-border"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function HstJwstBadge({ info }: { info: HstJwstInfo }) {
  const label = [info.collection, info.instrument, info.filters].filter(Boolean).join(" / ");
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <span className="px-2 py-0.5 text-xs rounded-md bg-primary/20 text-primary-foreground border border-primary/40">
        {label}
      </span>
      {info.jpeg_url && (
        <a
          href={info.jpeg_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary underline"
        >
          Ver preview
        </a>
      )}
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const bubbleWidth = !isUser && message.observationHtml
    ? "relative left-1/2 w-[min(1120px,calc(100vw-2rem))] max-w-none -translate-x-1/2"
    : "max-w-[85%]";

  return (
    <div
      className={`flex animate-fade-in ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`${bubbleWidth} rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/60 text-foreground border border-border"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-medium">
              IA
            </div>
            <span className="text-xs text-muted-foreground">astronomIA</span>
          </div>
        )}
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </div>
        {message.objectInfo && <ObjectInfoBar info={message.objectInfo} />}
        {message.hstJwst && <HstJwstBadge info={message.hstJwst} />}
        {message.imageUrl && (
          <div
            className="mt-3 rounded-lg overflow-hidden border border-border cursor-zoom-in max-w-[480px]"
            onClick={() => setLightboxSrc(message.imageUrl!)}
            title="Clic para ampliar"
          >
            <img
              src={message.imageUrl}
              alt="Imagen del análisis"
              className="w-full h-auto block"
            />
          </div>
        )}
        {message.analysisPlots && message.analysisPlots.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {message.analysisPlots.map((url, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden border border-border bg-muted/20 cursor-zoom-in"
                onClick={() => setLightboxSrc(url)}
                title="Clic para ampliar"
              >
                <img
                  src={url}
                  alt={`Gráfico de análisis ${i + 1}`}
                  className="w-full h-auto block"
                />
              </div>
            ))}
          </div>
        )}
        {lightboxSrc && (
          <Lightbox
            src={lightboxSrc}
            alt="Vista ampliada"
            onClose={() => setLightboxSrc(null)}
          />
        )}
        {message.coordinates && !message.imageUrl && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-xs rounded-md bg-muted/40 text-muted-foreground border border-border">
              RA {message.coordinates.ra_deg.toFixed(4)}
            </span>
            <span className="px-2 py-0.5 text-xs rounded-md bg-muted/40 text-muted-foreground border border-border">
              Dec {message.coordinates.dec_deg.toFixed(4)}
            </span>
            <span className="px-2 py-0.5 text-xs rounded-md bg-muted/40 text-muted-foreground border border-border">
              {message.coordinates.survey_used}
            </span>
          </div>
        )}
        {message.observationHtml && (
          <ObservationHtmlFrame html={message.observationHtml} />
        )}
        {/* Mini-rating: solo en mensajes del bot que ya tienen request_id
            asignado (se asigna cuando termina el stream). */}
        {!isUser && message.requestId && (
          <MiniRating requestId={message.requestId} />
        )}
      </div>
    </div>
  );
}
