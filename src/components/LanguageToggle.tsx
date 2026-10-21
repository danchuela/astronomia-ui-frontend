import { useLang, type Lang } from "@/lib/i18n";

const OPTIONS: { value: Lang; label: string; name: string }[] = [
  { value: "es", label: "ES", name: "Español" },
  { value: "en", label: "EN", name: "English" },
];

// ES | EN switch for the interface language (see lib/i18n.tsx).
export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  return (
    <div
      role="group"
      aria-label={t.languageLabel}
      className={`inline-flex shrink-0 rounded-md border border-border bg-muted/30 p-0.5 ${
        compact ? "flex-col" : ""
      }`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLang(o.value)}
          aria-pressed={lang === o.value}
          title={o.name}
          lang={o.value}
          className={`px-1.5 py-0.5 text-[11px] font-semibold rounded transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${
            lang === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
