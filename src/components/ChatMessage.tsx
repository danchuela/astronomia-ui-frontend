import { useState } from "react";
import type { HstJwstInfo, Message, ObjectInfo } from "@/types/chat";

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

  return (
    <div
      className={`flex animate-fade-in ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
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
          <iframe
            srcDoc={message.observationHtml}
            className="mt-3 w-full rounded-lg border border-border"
            style={{ height: "420px" }}
            sandbox="allow-scripts"
          />
        )}
      </div>
    </div>
  );
}
