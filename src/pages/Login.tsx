import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setEmail } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Introduce tu email");
      return;
    }
    setError("");
    setEmail(trimmed);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8 overflow-hidden">
      <img
        src="/logo.png"
        alt=""
        className="w-[36rem] max-w-[90vw] mx-auto mix-blend-screen -mb-6"
        style={{ mask: "radial-gradient(ellipse 51% 46% at 47% 49%, black 82%, transparent 100%)", WebkitMask: "radial-gradient(ellipse 51% 46% at 47% 49%, black 82%, transparent 100%)" }}
      />
      <img src="/logo-text.png" alt="astronomIA" className="h-16 mx-auto mb-4" />
      <div className="w-full max-w-sm text-center">
        <p className="text-muted-foreground text-base max-w-sm mx-auto mb-8">
          Tu asistente astronómico con inteligencia artificial. Explora el universo, analiza galaxias y planifica observaciones.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md p-6 shadow-lg text-left"
        >
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError("");
            }}
            placeholder="tu@email.com"
            className="w-full h-12 px-4 rounded-lg bg-background/50 border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoComplete="email"
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="mt-5 w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Entrar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
        <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 text-left">
          <div className="text-2xl mb-2">🔭</div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Visualización interactiva</h3>
          <p className="text-xs text-muted-foreground">Explora el cielo en múltiples longitudes de onda con el visor Aladin integrado</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 text-left">
          <div className="text-2xl mb-2">🌀</div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Análisis de galaxias</h3>
          <p className="text-xs text-muted-foreground">Segmentación, fotometría, morfología, perfiles de brillo e isofotometría</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 text-left">
          <div className="text-2xl mb-2">🌙</div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Planificación de observación</h3>
          <p className="text-xs text-muted-foreground">Planifica noches de observación según tu ubicación, equipamiento y condiciones</p>
        </div>
      </div>

    </div>
  );
}
