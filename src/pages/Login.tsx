import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setEmail } from "@/lib/auth";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLang } from "@/lib/i18n";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [email, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t.emailRequired);
      return;
    }
    setError("");
    setEmail(trimmed);
    navigate("/", { replace: true });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 gap-8 overflow-hidden">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <img
        src="/logo.png"
        alt=""
        className="w-[36rem] max-w-[90vw] mx-auto mix-blend-screen -mb-6"
        style={{ mask: "radial-gradient(ellipse 51% 46% at 47% 49%, black 82%, transparent 100%)", WebkitMask: "radial-gradient(ellipse 51% 46% at 47% 49%, black 82%, transparent 100%)" }}
      />
      <img src="/logo-text.png" alt="astronomIA" className="h-16 mx-auto mb-4" />
      <div className="w-full max-w-sm text-center">
        <p className="text-muted-foreground text-base max-w-sm mx-auto mb-8">
          {t.tagline}
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md p-6 shadow-lg text-left"
        >
          <h1 className="text-base font-semibold text-foreground mb-4">
            {t.demoAccess}
          </h1>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            {t.email}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError("");
            }}
            placeholder="demo@example.com"
            aria-describedby="demo-login-note"
            className="w-full h-12 px-4 rounded-lg bg-background/50 border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoComplete="email"
          />
          <p id="demo-login-note" className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {t.demoNote}
          </p>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="mt-5 w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            {t.enter}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
        {t.loginCards.map(([emoji, title, text]) => (
          <div key={title} className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 text-left">
            <div className="text-2xl mb-2">{emoji}</div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
