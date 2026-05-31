import { useEffect, useState } from "react";
import { sendFeedback } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────
//  FeedbackButton — Boton flotante + modal con formulario completo de
//  feedback. Vive en cualquier pantalla del Chat, justo encima del boton
//  de ayuda. El usuario puede elegir rating + comentario libre + email
//  opcional si quiere ser contactado.
//
//  Para feedback rapido (solo rating) existe un mini-rating dentro de
//  cada mensaje del bot — ese es independiente de este componente.
// ─────────────────────────────────────────────────────────────────────

interface FeedbackButtonProps {
  // request_id mas reciente del chat (el de la ultima respuesta del bot).
  // Si no hay aun ningun mensaje del bot, el modal lo permite igual y
  // envia una cadena vacia (n8n lo guarda como tal).
  latestRequestId: string | null;
}

type Status = "idle" | "submitting" | "success" | "error";

export function FeedbackButton({ latestRequestId }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [wantsContact, setWantsContact] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Cerrar con ESC.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Bloquear scroll del body mientras el modal este abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset al cerrar el modal (asi el siguiente que lo abra arranca limpio).
  function resetForm() {
    setRating(null);
    setComment("");
    setWantsContact(false);
    setEmail("");
    setStatus("idle");
    setErrorMsg("");
  }

  function handleClose() {
    setOpen(false);
    // Pequeno delay para que la animacion de cierre no muestre el reset.
    setTimeout(resetForm, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === null) {
      setErrorMsg("Selecciona pulgar arriba o abajo.");
      return;
    }
    if (wantsContact && !email.trim()) {
      setErrorMsg("Si quieres ser contactado/a, dame un email valido.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await sendFeedback({
        request_id: latestRequestId || "",
        rating,
        comment: comment.trim() || undefined,
        user_email: wantsContact ? email.trim() : undefined,
      });
      setStatus("success");
      // Auto-cerrar despues de 2 segundos para no obligar al usuario a
      // hacer click en cerrar.
      setTimeout(() => handleClose(), 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido.");
    }
  }

  return (
    <>
      {/* Boton flotante: encima del boton de ayuda. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Enviar feedback"
        title="Cuentanos que opinas"
        className="fixed bottom-20 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-lg backdrop-blur transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {/* Icono de bocadillo de comentario. */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Enviar feedback"
        >
          <div
            className="relative w-full max-w-md flex flex-col rounded-2xl border border-border bg-card text-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Cuentanos que opinas
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tu feedback ayuda a mejorar astronomIA.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Cuerpo: formulario o pantalla de exito */}
            {status === "success" ? (
              <div className="p-8 text-center space-y-3">
                <div className="text-5xl">🙏</div>
                <p className="text-sm text-foreground font-medium">
                  ¡Gracias por tu feedback!
                </p>
                <p className="text-xs text-muted-foreground">
                  Lo hemos registrado correctamente.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ¿Como ha ido tu experiencia?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRating("up")}
                      aria-pressed={rating === "up"}
                      className={`flex-1 rounded-lg border py-3 text-2xl transition-all ${
                        rating === "up"
                          ? "border-primary bg-primary/15 ring-2 ring-primary/60"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      onClick={() => setRating("down")}
                      aria-pressed={rating === "down"}
                      className={`flex-1 rounded-lg border py-3 text-2xl transition-all ${
                        rating === "down"
                          ? "border-primary bg-primary/15 ring-2 ring-primary/60"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      👎
                    </button>
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <label
                    htmlFor="feedback-comment"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Comentario{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    id="feedback-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Que te ha gustado, que mejorarias, que falta..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Contacto opcional */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantsContact}
                      onChange={(e) => setWantsContact(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">
                      Quiero que me contacten para hablar mas a fondo
                    </span>
                  </label>
                  {wantsContact && (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>

                {/* Error */}
                {errorMsg && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "submitting" || rating === null}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {status === "submitting" ? "Enviando..." : "Enviar feedback"}
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
              Pulsa{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-mono">
                Esc
              </kbd>{" "}
              o click fuera para cerrar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
