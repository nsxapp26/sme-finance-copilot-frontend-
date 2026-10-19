// Picks the robot for the hero: the 3D one on desktop when WebGL works and motion is allowed,
// otherwise the light SVG one (phones, tablets, reduced motion, no WebGL).
import React, { useCallback, useEffect, useState } from "react";
import { CyberRobot } from "./CyberRobot";

const Robot3D = React.lazy(() => import("./robot3d/Robot3D"));

function canUse3D(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(min-width: 1024px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    // failIfMajorPerformanceCaveat: no context on software-only WebGL (no GPU), so slow machines get the SVG robot
    const probe = document.createElement("canvas");
    const options = { failIfMajorPerformanceCaveat: true };
    const gl = (probe.getContext("webgl2", options) || probe.getContext("webgl", options)) as WebGLRenderingContext | null;
    if (!gl) return false;
    // Some browsers still hand out software renderers; skip 3D on those too
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // release the probe context right away
    return !/swiftshader|llvmpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

export const CopilotRobot: React.FC<{ animate: boolean; alert: boolean }> = ({ animate, alert }) => {
  const [desktop3D, setDesktop3D] = useState(() => animate && canUse3D());
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);

  // Re-check when the window crosses the desktop breakpoint or the motion setting changes
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop3D(animate && canUse3D());
    update();
    wide.addEventListener("change", update);
    return () => wide.removeEventListener("change", update);
  }, [animate]);

  const svgDesktop = <CyberRobot animate={animate} alert={alert} className="hidden lg:block absolute top-6 right-10 z-20 w-28 h-[140px]" />;
  return (
    <>
      {desktop3D && !failed ? (
        <React.Suspense fallback={svgDesktop}>
          <Robot3D alert={alert} onFail={onFail} className="hidden lg:block absolute -top-2 right-0 z-20 w-[300px] h-[300px]" />
        </React.Suspense>
      ) : svgDesktop}
      <CyberRobot animate={animate} alert={alert} greet={false} bubbleBelow className="lg:hidden absolute top-3 right-3 z-20 w-14 h-[70px]" />
    </>
  );
};
