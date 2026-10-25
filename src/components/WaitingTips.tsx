import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { WAITING_TIPS } from "@/lib/waitingTips";

const ROTATE_MS = 7000;

// Rotating astronomy facts while astronomIA works (backlog item 14): under the
// progress message of an answer, and while the interactive viewer loads.
export function WaitingTips({ compact = false }: { compact?: boolean }) {
  const { lang, t } = useLang();
  const tips = WAITING_TIPS[lang];
  // Random start, so two waits in a row do not show the same fact.
  const [index, setIndex] = useState(() => Math.floor(Math.random() * tips.length));

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % tips.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [tips.length]);

  return (
    <div
      className={`${compact ? "mt-2 max-w-sm text-center" : "mt-3 border-t border-border pt-2"} text-xs text-muted-foreground`}
    >
      <p className="font-medium text-foreground/80">{t.waitingTitle}</p>
      {/* key: re-mount on change so the fade runs (motion-safe: no animation if the user reduces motion) */}
      <p key={`${lang}-${index}`} className="mt-1 leading-relaxed motion-safe:animate-fade-in">
        {tips[index % tips.length]}
      </p>
    </div>
  );
}
