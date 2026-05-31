import { lazy, Suspense, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { HelpButton } from "@/components/HelpButton";
import {
  getConversations,
  getConversation,
  createConversation,
  appendMessage,
  updateMessage,
} from "@/lib/conversations";
import { sendMessageStream } from "@/lib/api";
import type { AladinCoordinates, Conversation, HstJwstInfo, Message, ObjectInfo, ViewSnapshot } from "@/types/chat";

const AladinViewer = lazy(() =>
  import("@/components/AladinViewer").then((mod) => ({ default: mod.AladinViewer }))
);

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(true);
  const [viewerHeight, setViewerHeight] = useState(400);
  const dragStartY = useRef<number | null>(null);
  const dragStartH = useRef<number>(400);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartH.current = viewerHeight;
    const onMove = (ev: MouseEvent) => {
      if (dragStartY.current === null) return;
      const delta = ev.clientY - dragStartY.current;
      setViewerHeight(Math.min(800, Math.max(160, dragStartH.current + delta)));
    };
    const onUp = () => {
      dragStartY.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [viewerHeight]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const viewerGetterRef = useRef<(() => Promise<ViewSnapshot | null>) | null>(null);
  const prevViewerCoordsRef = useRef<{ ra: number; dec: number } | null>(null);

  const current = currentId ? getConversation(currentId) : null;
  const messages = useMemo(() => current?.messages ?? [], [current?.messages]);

  // Single viewer source: last resolve message (coordinates present, no analysis image)
  const activeViewerCoords = useMemo<AladinCoordinates | null>(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.coordinates && !m.imageUrl) return m.coordinates;
    }
    return null;
  }, [messages]);

  const refreshConversations = () => setConversations(getConversations());

  useEffect(() => {
    viewerGetterRef.current = null;
    refreshConversations();
  }, [currentId]);

  const handleNewChat = () => {
    const conv = createConversation();
    setCurrentId(conv.id);
    refreshConversations();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentId(id);
  };

  const handleViewerReady = useCallback((getter: () => Promise<ViewSnapshot | null>) => {
    viewerGetterRef.current = getter;
  }, []);

  const handleViewerToggle = useCallback(async () => {
    if (viewerOpen && viewerGetterRef.current) {
      try {
        await viewerGetterRef.current();
      } catch {
        // The cached snapshot is best-effort; collapsing the viewer should still work.
      }
    }
    setViewerOpen((open) => !open);
  }, [viewerOpen]);

  const handleSend = async (text: string) => {
    let convId = currentId;
    if (!convId) {
      const conv = createConversation(text.slice(0, 50));
      convId = conv.id;
      setCurrentId(convId);
      refreshConversations();
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    appendMessage(convId, userMessage);
    refreshConversations();

    const assistantId = crypto.randomUUID();
    const assistantMessage: Message = { id: assistantId, role: "assistant", content: "…" };
    appendMessage(convId, assistantMessage);
    refreshConversations();

    setLoading(true);
    const conv = getConversation(convId);
    const history = (conv?.messages ?? [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && m.id !== assistantId && m.id !== userMessage.id)
      .map((m) => ({ role: m.role, content: m.content }));

    const base = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
    const viewerSnapshot = viewerGetterRef.current ? (await viewerGetterRef.current() ?? undefined) : undefined;

    try {
      await sendMessageStream(text, convId, history, (event) => {
        if (event.type === "status") {
          updateMessage(convId, assistantId, { content: event.message });
        } else if (event.type === "summary") {
          updateMessage(convId, assistantId, { content: event.summary });
        } else if (event.type === "artifacts") {
          const imageUrl = event.image_url ?? (event.html_chart ? undefined : base ? `${base}/artifacts/${event.request_id}/image` : undefined);
          const patch: Partial<Pick<Message, "imageUrl" | "analysisPlots" | "coordinates" | "objectInfo" | "hstJwst" | "observationHtml">> = {};
          if (imageUrl) patch.imageUrl = imageUrl;
          if (event.analysis_plots?.length) {
            patch.analysisPlots = event.analysis_plots.map(
              (name) => `${base}/artifacts/${event.request_id}/plot/${name}`
            );
          }
          if (event.coordinates) patch.coordinates = event.coordinates as AladinCoordinates;
          if (event.object_info) patch.objectInfo = event.object_info as ObjectInfo;
          if (event.hst_jwst) patch.hstJwst = event.hst_jwst as unknown as HstJwstInfo;
          if (event.html_chart) patch.observationHtml = event.html_chart;
          if (Object.keys(patch).length > 0) updateMessage(convId, assistantId, patch);
        } else if (event.type === "end") {
          if (event.summary) updateMessage(convId, assistantId, { content: event.summary });
          if (event.coordinates) updateMessage(convId, assistantId, { coordinates: event.coordinates as AladinCoordinates });
          if (event.object_info) updateMessage(convId, assistantId, { objectInfo: event.object_info as ObjectInfo });
          if (event.hst_jwst) updateMessage(convId, assistantId, { hstJwst: event.hst_jwst as unknown as HstJwstInfo });
          if (event.object_name) updateMessage(convId, assistantId, { objectName: event.object_name });
        } else if (event.type === "error") {
          updateMessage(convId, assistantId, { content: event.message });
        }
        refreshConversations();
      }, viewerSnapshot);
    } catch (err) {
      updateMessage(convId, assistantId, {
        content: err instanceof Error ? err.message : "No se pudo obtener respuesta.",
      });
      refreshConversations();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Only open viewer when coordinates actually change (not on every re-render of the coords object).
  useEffect(() => {
    if (!activeViewerCoords) return;
    const { ra_deg, dec_deg } = activeViewerCoords;
    const prev = prevViewerCoordsRef.current;
    if (!prev || prev.ra !== ra_deg || prev.dec !== dec_deg) {
      prevViewerCoordsRef.current = { ra: ra_deg, dec: dec_deg };
      setViewerOpen(true);
    }
  }, [activeViewerCoords]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeViewerCoords && (
          <div className="border-b border-border shrink-0">
            <button
              onClick={handleViewerToggle}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 shrink-0 transition-transform"
                style={{ transform: viewerOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M4 6l4 4 4-4H4z" />
              </svg>
              <span className="font-medium">Vista interactiva</span>
              <span className="ml-auto text-xs opacity-60">
                RA {activeViewerCoords.ra_deg.toFixed(2)}° Dec {activeViewerCoords.dec_deg.toFixed(2)}°
              </span>
            </button>
            <Suspense
              fallback={
                <div className="px-4 pb-3 text-xs text-muted-foreground animate-pulse">
                  Cargando visor interactivo...
                </div>
              }
            >
              {/* Hide with CSS; never unmount. Aladin is a singleton and losing
                  the DOM resets zoom, survey, and framing. */}
              <div style={{ display: viewerOpen ? "block" : "none" }} className="px-4 pb-1">
                <AladinViewer
                  coordinates={activeViewerCoords}
                  onViewerReady={handleViewerReady}
                  height={viewerHeight}
                />
                {/* Resize handle */}
                <div
                  onMouseDown={handleResizeMouseDown}
                  className="mt-1 h-2 flex items-center justify-center cursor-row-resize group"
                  title="Arrastra para redimensionar"
                >
                  <div className="w-10 h-1 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
                </div>
              </div>
            </Suspense>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <img
                  src="/logo.png"
                  alt=""
                  className="w-[24rem] max-w-[80vw] mx-auto mix-blend-screen -mb-4"
                  style={{ mask: "radial-gradient(ellipse 51% 46% at 47% 49%, black 82%, transparent 100%)", WebkitMask: "radial-gradient(ellipse 51% 46% at 47% 49%, black 82%, transparent 100%)" }}
                />
                <img src="/logo-text.png" alt="astronomIA" className="h-10 mx-auto mb-2" />
                <p className="text-muted-foreground max-w-lg text-sm mb-8">
                  Tu asistente astronómico con inteligencia artificial. Explora el universo, analiza galaxias y planifica observaciones.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full mb-8">
                  <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 text-left">
                    <div className="text-2xl mb-2">🔭</div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Visualización</h3>
                    <p className="text-xs text-muted-foreground">Explora el cielo con el visor interactivo en múltiples longitudes de onda</p>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 text-left">
                    <div className="text-2xl mb-2">🌀</div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Análisis</h3>
                    <p className="text-xs text-muted-foreground">Segmentación, fotometría, morfología y perfiles de brillo de galaxias</p>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 text-left">
                    <div className="text-2xl mb-2">🌙</div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Observación</h3>
                    <p className="text-xs text-muted-foreground">Planifica tus noches de observación según tu ubicación y condiciones</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                  {[
                    "Muéstrame la galaxia de Andrómeda",
                    "Analiza M51",
                    "¿Qué puedo observar esta noche desde Madrid?",
                    "Busca NGC 1300",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSend(suggestion)}
                      className="px-3 py-1.5 rounded-full border border-border/40 bg-card/30 backdrop-blur-sm text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-background/70 backdrop-blur-md p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSend} disabled={loading} />
          </div>
        </div>
      </div>
      {/* Botón flotante de ayuda — accesible desde cualquier punto del chat. */}
      <HelpButton />
    </div>
  );
}
