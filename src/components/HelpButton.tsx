import { useEffect, useMemo, useState } from "react";
import { OPEN_HELP_EVENT } from "@/lib/help";
import { HELP_CONTENT } from "@/lib/helpContent";
import { useLang } from "@/lib/i18n";

// ─────────────────────────────────────────────────────────────────────
//  HelpButton — Botón flotante + modal con glosario completo de astronomIA.
//  Visible en cualquier pantalla del Chat. Permite buscar términos por
//  nombre, definición o ejemplo (búsqueda case-insensitive y sin acentos).
//  Se cierra con ESC, click en el backdrop o el botón X.
// ─────────────────────────────────────────────────────────────────────

// Content in lib/helpContent.ts (Spanish and English).

// Normaliza texto para búsqueda: minúsculas + sin acentos.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function HelpButton() {
  const { lang, t } = useLang();
  const content = HELP_CONTENT[lang];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Open on request from other components (see openHelp).
  useEffect(() => {
    const onOpen = (e: Event) => {
      setQuery((e as CustomEvent<string>).detail ?? "");
      setOpen(true);
    };
    window.addEventListener(OPEN_HELP_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_HELP_EVENT, onOpen);
  }, []);

  // Cerrar con tecla ESC.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Evitar scroll del body cuando el modal está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Filtrar contenido según la query (busca en término, definición y ejemplo).
  const filtered = useMemo(() => {
    if (!query.trim()) return content;
    const q = normalize(query);
    return content.map((cat) => ({
      ...cat,
      // A match on the section title or description shows the whole section.
      entries:
        normalize(cat.title).includes(q) || normalize(cat.description ?? "").includes(q)
          ? cat.entries
          : cat.entries.filter(
        (e) =>
          normalize(e.term).includes(q) ||
          normalize(e.definition).includes(q) ||
          (e.example ? normalize(e.example).includes(q) : false)
      ),
    })).filter((cat) => cat.entries.length > 0);
  }, [query, content]);

  return (
    <>
      {/* Botón flotante: pequeño, semitransparente, esquina inferior derecha. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.helpOpen}
        title={t.helpTooltip}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-lg backdrop-blur transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
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
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {/* Modal: aparece solo si open=true. */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.helpDialog}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card text-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t.helpTitle}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.helpSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.helpClose}
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

            {/* Search */}
            <div className="p-4 border-b border-border">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.helpSearch}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            {/* Content (scrollable) */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-6">
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 text-sm">
                  {t.helpNoMatch(query)}
                </div>
              ) : (
                filtered.map((cat) => (
                  <section key={cat.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{cat.emoji}</span>
                      <h3 className="text-base font-semibold text-foreground">
                        {cat.title}
                      </h3>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                    <div className="space-y-2.5">
                      {cat.entries.map((entry) => (
                        <div
                          key={entry.term}
                          className="rounded-lg border border-border bg-muted/30 p-3"
                        >
                          <div className="text-sm font-semibold text-foreground mb-1">
                            {entry.term}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {entry.definition}
                          </p>
                          {entry.example && (
                            <p className="mt-2 text-xs text-primary/90 italic leading-relaxed">
                              💡 {entry.example}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}

              {/* Créditos del TFM — siempre visibles al final del contenido. */}
              <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  {t.creditsTfm}{" "}
                  <span className="text-foreground font-medium">
                    {t.creditsTfmName}
                  </span>{" "}
                  {t.creditsOf}{" "}
                  <span className="text-foreground font-medium">
                    {t.creditsMaster}
                  </span>
                  {t.creditsPresented}
                  <span className="text-foreground font-medium">
                    Universidad Internacional de La Rioja (UNIR)
                  </span>{" "}
                  {t.creditsIn}{" "}
                  <span className="text-foreground font-medium">2026</span>{"."}
                </p>
                <p>
                  {t.creditsAuthors}{" "}
                  <span className="text-foreground font-medium">
                    Daniel Anchuela
                  </span>{" "}
                  {t.creditsAnd}{" "}
                  <span className="text-foreground font-medium">
                    María Ilse Dovale
                  </span>{"."}
                </p>
                <p>
                  {t.creditsDirector}{" "}
                  <span className="text-foreground font-medium">
                    {t.creditsDirectorName}
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
              {t.pressEsc}{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-mono">
                Esc
              </kbd>{" "}
              {t.orClickOutside}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
