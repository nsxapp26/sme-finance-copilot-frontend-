// พลุกระดาษตอนวิเคราะห์เสร็จ (เขียนเองด้วย canvas ไม่ใช้ library)
// ไม่เล่นถ้าเปิดลดการเคลื่อนไหว
const COLORS = ["#6C4CF1", "#9B82FF", "#16C1B0", "#4FE7D8", "#F59A23", "#E5484D", "#FFFFFF"];

export function fireConfetti(reduced = false) {
  if (reduced || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  ctx.scale(ratio, ratio);

  // ยิงจากมุมล่างซ้ายและขวา
  const pieces = Array.from({ length: 140 }, (_, i) => {
    const fromLeft = i % 2 === 0;
    const angle = (fromLeft ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.9;
    const speed = 9 + Math.random() * 8;
    return {
      x: fromLeft ? 0 : window.innerWidth,
      y: window.innerHeight * 0.85,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: COLORS[i % COLORS.length],
    };
  });

  const start = performance.now();
  const tick = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of pieces) {
      p.vy += 0.28; // แรงโน้มถ่วง
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 2400);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
      ctx.restore();
    }
    if (t < 2400) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}
