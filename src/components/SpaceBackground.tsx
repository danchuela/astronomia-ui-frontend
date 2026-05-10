import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  opacity: number;
  maxOpacity: number;
  fadeSpeed: number;
  state: "fadein" | "hold" | "fadeout";
  holdUntil: number;
};

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  active: boolean;
  len: number;
};

function makeStar(boot = false): Star {
  const maxOpacity = Math.random() * 0.6 + 0.35;
  const state = boot
    ? ((["fadein", "hold", "fadeout"][Math.floor(Math.random() * 3)] as Star["state"]))
    : "fadein";
  return {
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.1 + 0.2,
    opacity: boot ? Math.random() * maxOpacity : 0,
    maxOpacity,
    fadeSpeed: 0.003 + Math.random() * 0.005,
    state,
    holdUntil: Date.now() + Math.random() * 7000,
  };
}

function spawnMeteor(m: Meteor) {
  if (Math.random() > 0.4) {
    m.x = Math.random() * 0.9;
    m.y = -0.02;
  } else {
    m.x = -0.02;
    m.y = Math.random() * 0.5;
  }
  const angle = Math.PI / 5 + Math.random() * (Math.PI / 4);
  const spd = 0.003 + Math.random() * 0.005;
  m.vx = Math.cos(angle) * spd;
  m.vy = Math.sin(angle) * spd;
  m.opacity = 0.8 + Math.random() * 0.2;
  m.len = 0.05 + Math.random() * Math.random() * 0.25;
  m.active = true;
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let mouseX = 0.5;
    let mouseY = 0.5;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    };
    document.addEventListener("mousemove", onMouseMove);

    const stars: Star[] = Array.from({ length: 220 }, () => makeStar(true));
    const meteors: Meteor[] = Array.from({ length: 4 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, opacity: 0, active: false, len: 0.09,
    }));
    let nextMeteor = Date.now() + 3000 + Math.random() * 4000;
    let animId: number;

    function draw(t: number) {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#080810";
      ctx.fillRect(0, 0, w, h);

      const drift = t * 0.00004;
      const px = (mouseX - 0.5) * 0.05;
      const py = (mouseY - 0.5) * 0.05;

      const x1 = w * (0.15 + Math.sin(drift) * 0.04 - px * 0.9);
      const y1 = h * (0.25 + Math.cos(drift * 0.7) * 0.03 - py * 0.9);
      const n1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, w * 0.45);
      n1.addColorStop(0, "rgba(99,66,255,0.13)");
      n1.addColorStop(1, "transparent");
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, w, h);

      const x2 = w * (0.85 + Math.cos(drift * 0.8) * 0.04 - px * 1.3);
      const y2 = h * (0.75 + Math.sin(drift * 0.9) * 0.03 - py * 1.3);
      const n2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, w * 0.4);
      n2.addColorStop(0, "rgba(139,92,246,0.1)");
      n2.addColorStop(1, "transparent");
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, w, h);

      const x3 = w * (0.55 + Math.sin(drift * 1.1 + 1) * 0.03 - px * 0.5);
      const y3 = h * (0.05 + Math.cos(drift * 0.6) * 0.02 - py * 0.5);
      const n3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, w * 0.3);
      n3.addColorStop(0, "rgba(56,189,248,0.07)");
      n3.addColorStop(1, "transparent");
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, w, h);

      const now = Date.now();
      for (const s of stars) {
        if (s.state === "fadein") {
          s.opacity += s.fadeSpeed;
          if (s.opacity >= s.maxOpacity) {
            s.opacity = s.maxOpacity;
            s.state = "hold";
            s.holdUntil = now + 2000 + Math.random() * 6000;
          }
        } else if (s.state === "hold") {
          if (now >= s.holdUntil) s.state = "fadeout";
        } else {
          s.opacity -= s.fadeSpeed * 0.6;
          if (s.opacity <= 0) Object.assign(s, makeStar());
        }
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, s.opacity).toFixed(3)})`;
        ctx.fill();
      }

      if (Date.now() >= nextMeteor) {
        const m = meteors.find((m) => !m.active);
        if (m) spawnMeteor(m);
        nextMeteor = Date.now() + 4000 + Math.random() * 6000;
      }
      for (const m of meteors) {
        if (!m.active) continue;
        m.x += m.vx;
        m.y += m.vy;
        m.opacity -= 0.014;
        if (m.opacity <= 0 || m.x > 1.1 || m.y > 1.1) {
          m.active = false;
          continue;
        }
        const len = m.len;
        const mag = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        const dx = m.vx / mag;
        const dy = m.vy / mag;
        const grad = ctx.createLinearGradient(
          m.x * w, m.y * h,
          (m.x - dx * len) * w, (m.y - dy * len) * h
        );
        grad.addColorStop(0, `rgba(255,255,255,${m.opacity.toFixed(2)})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(m.x * w, m.y * h);
        ctx.lineTo((m.x - dx * len) * w, (m.y - dy * len) * h);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
