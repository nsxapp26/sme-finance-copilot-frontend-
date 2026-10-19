// React wrapper for the three.js robot. Loaded lazily (see CopilotRobot) so three.js
// is only downloaded on desktop when the hero is shown.
import React, { useEffect, useRef } from "react";
import { useT } from "@/i18n";
import { RobotBubble, useRobotTips } from "../CyberRobot";
import { createRobotScene, RobotScene } from "./scene";

const Robot3D: React.FC<{ alert: boolean; className?: string; onFail: () => void }> = ({ alert, className = "", onFail }) => {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<RobotScene | null>(null);
  const { tipKey, showTip, next } = useRobotTips(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let robot: RobotScene;
    try {
      robot = createRobotScene(canvas);
    } catch {
      onFail(); // WebGL context could not be created: fall back to the SVG robot
      return;
    }
    sceneRef.current = robot;

    // Head and eyes follow the mouse anywhere on the page
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = canvas.getBoundingClientRect();
      robot.setPointer((event.clientX - (box.left + box.width / 2)) / 600, (event.clientY - (box.top + box.height / 2)) / 400);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Stop rendering when the hero is off screen or the tab is hidden
    let visible = true;
    const update = () => robot.setRunning(visible && !document.hidden);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    io.observe(canvas);
    document.addEventListener("visibilitychange", update);
    const onLost = (event: Event) => { event.preventDefault(); onFail(); };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", update);
      canvas.removeEventListener("webglcontextlost", onLost);
      io.disconnect();
      robot.dispose();
      sceneRef.current = null;
    };
  }, [onFail]);

  useEffect(() => { sceneRef.current?.setAlert(alert); }, [alert]);

  return (
    // The canvas is bigger than the robot (room for the rings), so only the robot itself takes clicks
    <div className={`pointer-events-none select-none ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <RobotBubble alert={alert} tipKey={tipKey} show={showTip} className="right-[70%] top-8" />
      <button type="button" aria-label={t("robot.label")} title={t("robot.label")}
        onClick={() => { next(); sceneRef.current?.wave(); }}
        className="pointer-events-auto absolute left-1/2 top-1/2 h-[62%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-resource-glow" />
    </div>
  );
};

export default Robot3D;
