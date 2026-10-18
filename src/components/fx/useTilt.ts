// การ์ดเอียง 3 มิติตามเมาส์ ใช้ตัวเดียวทั้งแอป (event delegation)
// การ์ดไหนอยากให้เอียง ใส่ attribute data-tilt ก็พอ
// ไม่ทำงานบนจอสัมผัส และไม่ทำงานเมื่อเปิดลดการเคลื่อนไหว
import { useEffect } from "react";

const MAX_DEG = 7;

export function useTilt(disabled: boolean) {
  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current: HTMLElement | null = null;
    let frame = 0;

    const reset = (el: HTMLElement) => {
      el.classList.remove("is-tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      // การ์ดที่มี data-tilt เอง หรือการ์ดลูกของ grid ที่มี data-tilt-grid
      const el = (event.target as Element | null)?.closest<HTMLElement>("[data-tilt], [data-tilt-grid] > *") ?? null;
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width; // 0..1
        const py = (event.clientY - rect.top) / rect.height;
        // การ์ดใหญ่เอียงน้อยลง จะได้ไม่ดูเวียนหัว
        const deg = MAX_DEG * Math.min(1, 280 / Math.max(rect.width, 1));
        el.style.setProperty("--ry", `${((px - 0.5) * 2 * deg).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${((0.5 - py) * 2 * deg).toFixed(2)}deg`);
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        el.classList.add("is-tilting");
      });
    };
    const onLeave = () => { if (current) reset(current); current = null; };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (current) reset(current);
    };
  }, [disabled]);
}
