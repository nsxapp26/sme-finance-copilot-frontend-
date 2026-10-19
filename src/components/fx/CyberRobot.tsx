// Copilot robot mascot for the hero (plain SVG + CSS, no library).
// Floats, blinks, waves, and its eyes follow the pointer. Click it to cycle tips.
// "alert" turns the eyes and core amber while a bottleneck scenario is highlighted.
// Everything stops when reduced motion is on.
import React, { useEffect, useId, useRef, useState } from "react";
import { useT, TranslationKey } from "@/i18n";

const TIPS: TranslationKey[] = ["robot.tip1", "robot.tip2", "robot.tip3", "robot.tip4"];

// Tip rotation shared by the SVG robot and the 3D robot
export function useRobotTips(greet: boolean) {
  const [tip, setTip] = useState(0);
  const [showTip, setShowTip] = useState(greet);
  // Hide the first greeting after a while so it doesn't cover the hero forever
  useEffect(() => {
    const timer = window.setTimeout(() => setShowTip(false), 7000);
    return () => window.clearTimeout(timer);
  }, []);
  const next = () => { setTip((value) => (value + 1) % TIPS.length); setShowTip(true); };
  return { tipKey: TIPS[tip], showTip, next };
}

export const RobotBubble: React.FC<{ alert: boolean; tipKey: TranslationKey; show: boolean; below?: boolean; className?: string }> = ({ alert, tipKey, show, below = false, className = "" }) => {
  const t = useT();
  if (!show && !alert) return null;
  return (
    <div role="status" aria-live="polite"
      className={`robot-bubble absolute z-30 ${below ? "right-0 top-full mt-1" : className || "right-full top-2 mr-2"} w-44 sm:w-52 rounded-xl border border-resource-glow/40 bg-navy-deep/90 px-3 py-2 text-[11px] leading-snug text-slate-100 shadow-glow-resource backdrop-blur`}>
      <span className="font-mono text-[10px] text-resource-glow">&gt; copilot:</span> {alert ? t("robot.alert") : t(tipKey)}
    </div>
  );
};

export const CyberRobot: React.FC<{ animate: boolean; alert?: boolean; greet?: boolean; bubbleBelow?: boolean; className?: string }> = ({ animate, alert = false, greet = true, bubbleBelow = false, className = "" }) => {
  const t = useT();
  const ref = useRef<SVGSVGElement>(null);
  // Unique gradient ids: two robots can be mounted (desktop + phone) and one of them is hidden
  const uid = useId().replace(/:/g, "");
  const shell = `robot-shell-${uid}`, coreFill = `robot-core-${uid}`;
  const [look, setLook] = useState({ x: 0, y: 0 });
  const { tipKey, showTip, next } = useRobotTips(greet);

  // Eyes follow the pointer (mouse only, max 3px so the eyes stay inside the visor)
  useEffect(() => {
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !ref.current) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!ref.current) return; // unmounted before the frame ran
        const box = ref.current.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height * 0.35);
        const dist = Math.max(1, Math.hypot(dx, dy));
        const reach = Math.min(3, dist / 60);
        setLook({ x: (dx / dist) * reach, y: (dy / dist) * reach });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", onMove); };
  }, [animate]);

  const eye = alert ? "#F59A23" : "#4FE7D8";
  const core = alert ? "#F59A23" : "#9B82FF";

  return (
    <div className={`select-none ${className || "relative"}`}>
      <RobotBubble alert={alert} tipKey={tipKey} show={showTip} below={bubbleBelow} />
      <button type="button" aria-label={t("robot.label")} title={t("robot.label")}
        onClick={next}
        className={`block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-resource-glow ${animate ? "robot-float" : ""}`}>
        <svg ref={ref} viewBox="0 0 120 150" className="h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={shell} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2A3A78" />
              <stop offset="1" stopColor="#141E46" />
            </linearGradient>
            <radialGradient id={coreFill}>
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.35" stopColor={core} />
              <stop offset="1" stopColor={core} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* floor glow */}
          <ellipse cx="60" cy="144" rx="30" ry="5" fill={eye} opacity="0.25" className={animate ? "robot-shadow" : ""} />

          {/* antenna */}
          <line x1="60" y1="18" x2="60" y2="6" stroke="#5B6BA8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="5" r="4" fill={core} className={animate ? "robot-antenna" : ""} />

          {/* left arm (still) */}
          <rect x="12" y="78" width="12" height="30" rx="6" fill={`url(#${shell})`} stroke="#3C4D92" />
          {/* right arm waves */}
          <g className={animate ? "robot-wave" : ""} style={{ transformOrigin: "102px 80px" }}>
            <rect x="96" y="78" width="12" height="30" rx="6" fill={`url(#${shell})`} stroke="#3C4D92" />
            <circle cx="102" cy="110" r="5" fill="#3C4D92" />
          </g>

          {/* body */}
          <rect x="26" y="70" width="68" height="56" rx="16" fill={`url(#${shell})`} stroke="#3C4D92" strokeWidth="1.5" />
          <circle cx="60" cy="96" r="13" fill={`url(#${coreFill})`} className={animate ? "robot-core" : ""} />
          <circle cx="60" cy="96" r="6" fill="none" stroke="#ffffff" strokeOpacity="0.6" />
          <path d="M36 118h48" stroke={eye} strokeOpacity="0.5" strokeWidth="2" strokeDasharray="4 4" className={animate ? "robot-data" : ""} />

          {/* head */}
          <rect x="22" y="18" width="76" height="52" rx="20" fill={`url(#${shell})`} stroke="#3C4D92" strokeWidth="1.5" />
          <rect x="16" y="36" width="8" height="16" rx="4" fill="#3C4D92" />
          <rect x="96" y="36" width="8" height="16" rx="4" fill="#3C4D92" />
          {/* visor */}
          <rect x="31" y="28" width="58" height="30" rx="14" fill="#070D24" stroke={eye} strokeOpacity="0.45" />
          {/* eyes */}
          <g transform={`translate(${look.x} ${look.y})`} style={{ transition: "transform 0.15s ease-out" }}>
            <g className={animate ? "robot-blink" : ""} style={{ transformOrigin: "60px 43px" }}>
              <rect x="42" y="37" width="10" height="12" rx="5" fill={eye} />
              <rect x="68" y="37" width="10" height="12" rx="5" fill={eye} />
            </g>
          </g>
          {/* mouth / status bar */}
          <rect x="52" y="53" width="16" height="2" rx="1" fill={eye} opacity="0.7" />
        </svg>
      </button>
    </div>
  );
};
