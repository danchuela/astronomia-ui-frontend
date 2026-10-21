import { useCallback, useEffect, useState } from "react";
import { getLang, LanguageContext, storeLang, texts, type Lang } from "@/lib/i18n";

// Holds the interface language for the whole app (see lib/i18n.ts).
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getLang);

  const setLang = useCallback((next: Lang) => {
    storeLang(next);
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: texts(lang) }}>{children}</LanguageContext.Provider>
  );
}
