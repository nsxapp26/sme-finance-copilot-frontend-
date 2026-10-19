// 3D copilot robot built from three.js primitives (no model file, no license to track).
// Imperative on purpose: React only mounts the canvas; this module owns the render loop.
// Glow is faked with additive sprites instead of a bloom pass, so the canvas stays transparent
// over the hero gradient.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type RobotScene = {
  setPointer: (x: number, y: number) => void; // -1..1 relative to the canvas center
  setAlert: (alert: boolean) => void;
  wave: () => void;
  setRunning: (running: boolean) => void;
  dispose: () => void;
};

const CYAN = new THREE.Color("#4FE7D8");
const PURPLE = new THREE.Color("#9B82FF");
const AMBER = new THREE.Color("#F59A23");

// Soft round glow texture drawn once on a 2D canvas
function glowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRobotScene(canvas: HTMLCanvasElement): RobotScene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.05, 8.8);

  // Lights: soft fill + white key + purple and teal rim lights for the cyber look
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rimPurple = new THREE.PointLight(PURPLE, 14, 12);
  rimPurple.position.set(-3, 1.5, -1.5);
  scene.add(rimPurple);
  const rimCyan = new THREE.PointLight(CYAN, 12, 12);
  rimCyan.position.set(3, -0.5, -1.5);
  scene.add(rimCyan);

  // Shared materials
  const shell = new THREE.MeshStandardMaterial({ color: "#26356f", metalness: 0.85, roughness: 0.28, envMapIntensity: 1.2 });
  const shellDark = new THREE.MeshStandardMaterial({ color: "#141d45", metalness: 0.9, roughness: 0.35 });
  const visorMat = new THREE.MeshPhysicalMaterial({ color: "#05081a", metalness: 0.2, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: CYAN.clone(), toneMapped: false });
  const coreMat = new THREE.MeshBasicMaterial({ color: PURPLE.clone(), toneMapped: false });
  const neonCyan = new THREE.MeshBasicMaterial({ color: CYAN.clone(), toneMapped: false });
  const neonPurple = new THREE.MeshBasicMaterial({ color: PURPLE.clone(), toneMapped: false });
  const glowTex = glowTexture();
  const glow = (color: THREE.Color, size: number, opacity = 0.9) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    sprite.scale.setScalar(size);
    return sprite;
  };

  const robot = new THREE.Group();
  scene.add(robot);

  // ---- Head ----
  const head = new THREE.Group();
  head.position.y = 1.05;
  robot.add(head);
  head.add(new THREE.Mesh(new RoundedBoxGeometry(1.55, 1.12, 1.2, 6, 0.32), shell));
  const visor = new THREE.Mesh(new RoundedBoxGeometry(1.26, 0.62, 0.12, 6, 0.14), visorMat);
  visor.position.z = 0.57;
  head.add(visor);
  const eyes = new THREE.Group();
  eyes.position.z = 0.64;
  head.add(eyes);
  const eyeGeo = new RoundedBoxGeometry(0.17, 0.26, 0.04, 4, 0.06);
  const eyeGlows: THREE.Sprite[] = [];
  for (const x of [-0.27, 0.27]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.x = x;
    eyes.add(eye);
    const g = glow(CYAN.clone(), 0.75, 0.75);
    g.position.set(x, 0, 0.05);
    eyes.add(g);
    eyeGlows.push(g);
  }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.025, 0.02), neonCyan);
  mouth.position.set(0, -0.2, 0.64);
  head.add(mouth);
  // ear pods with neon rims
  for (const x of [-0.82, 0.82]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 32), shellDark);
    ear.rotation.z = Math.PI / 2;
    ear.position.x = x;
    head.add(ear);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 12, 48), neonPurple);
    rim.rotation.y = Math.PI / 2;
    rim.position.x = x + Math.sign(x) * 0.075;
    head.add(rim);
  }
  // antenna
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.45, 12), shellDark);
  antenna.position.y = 0.78;
  head.add(antenna);
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 24), coreMat);
  antennaTip.position.y = 1.03;
  head.add(antennaTip);
  const antennaGlow = glow(PURPLE.clone(), 0.7);
  antennaGlow.position.y = 1.03;
  head.add(antennaGlow);

  // ---- Neck + torso ----
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.22, 24), shellDark);
  neck.position.y = 0.4;
  robot.add(neck);
  const torso = new THREE.Group();
  torso.position.y = -0.18;
  robot.add(torso);
  torso.add(new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.02, 0.86, 6, 0.32), shell));
  // chest reactor: glass ring + spinning inner ring + glowing core
  const chest = new THREE.Group();
  chest.position.set(0, 0.04, 0.44);
  torso.add(chest);
  chest.add(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 16, 64), shellDark));
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.014, 12, 48, Math.PI * 1.5), neonPurple);
  chest.add(coreRing);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), coreMat);
  chest.add(core);
  const coreGlow = glow(PURPLE.clone(), 1.1, 0.85);
  coreGlow.position.z = 0.05;
  chest.add(coreGlow);
  // side light strips
  for (const x of [-0.5, 0.5]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.42, 0.02), neonCyan);
    strip.position.set(x, -0.02, 0.43);
    torso.add(strip);
  }

  // ---- Arms (pivot at the shoulder) ----
  const makeArm = (side: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.8, 0.12, 0);
    torso.add(pivot);
    pivot.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), shellDark));
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.42, 8, 16), shell);
    arm.position.y = -0.38;
    pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), shellDark);
    hand.position.y = -0.72;
    pivot.add(hand);
    const knuckle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 32), neonCyan);
    knuckle.rotation.x = Math.PI / 2;
    knuckle.position.y = -0.62;
    pivot.add(knuckle);
    pivot.rotation.z = side * 0.12;
    return pivot;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // ---- Hover base + thruster ----
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.24, 0.32, 32), shellDark);
  base.position.y = -0.86;
  robot.add(base);
  const thrusterRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 12, 48), neonCyan);
  thrusterRing.rotation.x = Math.PI / 2;
  thrusterRing.position.y = -1.03;
  robot.add(thrusterRing);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.75, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: CYAN.clone(), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
  );
  flame.rotation.x = Math.PI;
  flame.position.y = -1.42;
  robot.add(flame);
  const thrusterGlow = glow(CYAN.clone(), 1.2, 0.7);
  thrusterGlow.position.y = -1.15;
  robot.add(thrusterGlow);

  // exhaust sparks
  const SPARKS = 40;
  const sparkPos = new Float32Array(SPARKS * 3);
  const sparkSpeed = new Float32Array(SPARKS);
  const resetSpark = (i: number) => {
    sparkPos[i * 3] = (Math.random() - 0.5) * 0.3;
    sparkPos[i * 3 + 1] = -1.1;
    sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    sparkSpeed[i] = 0.6 + Math.random() * 0.9;
  };
  for (let i = 0; i < SPARKS; i++) { resetSpark(i); sparkPos[i * 3 + 1] -= Math.random() * 1.2; }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ map: glowTex, color: CYAN.clone(), size: 0.09, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  robot.add(sparks);

  // ---- Holographic orbit rings (around the robot, not attached to the bob) ----
  const ringMat = (color: THREE.Color, opacity: number) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.008, 8, 160), ringMat(CYAN.clone(), 0.55));
  ringA.rotation.x = Math.PI / 2.25;
  scene.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.006, 8, 160, Math.PI * 1.4), ringMat(PURPLE.clone(), 0.5));
  ringB.rotation.set(Math.PI / 2.6, 0.4, 0);
  scene.add(ringB);
  const orbiter = glow(CYAN.clone(), 0.35, 1);
  scene.add(orbiter);
  // floor glow
  const floor = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), new THREE.MeshBasicMaterial({ map: glowTex, color: CYAN.clone(), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.9;
  scene.add(floor);

  // ---- State ----
  const pointer = new THREE.Vector2();
  const look = new THREE.Vector2();
  let alert = false;
  let waveStart = -10;
  let nextBlink = 2;
  let nextIdleWave = 4;
  let running = true;
  let frame = 0;
  let lastTime = 0;
  const clock = new THREE.Clock();

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const tint = (color: THREE.Color) => {
    eyeMat.color.copy(color);
    for (const g of eyeGlows) g.material.color.copy(color);
    coreMat.color.copy(alert ? AMBER : PURPLE);
    coreGlow.material.color.copy(alert ? AMBER : PURPLE);
    antennaGlow.material.color.copy(alert ? AMBER : PURPLE);
  };

  const render = () => {
    if (!running) return;
    frame = requestAnimationFrame(render);
    const t = clock.getElapsedTime();

    // float + slow turn toward the pointer
    robot.position.y = Math.sin(t * 1.6) * 0.09;
    look.lerp(pointer, 0.08);
    robot.rotation.y = look.x * 0.35 + Math.sin(t * 0.4) * 0.08;
    head.rotation.y = look.x * 0.35;
    head.rotation.x = -look.y * 0.25;
    eyes.position.x = look.x * 0.05;
    eyes.position.y = -look.y * 0.03;

    // blink
    if (t > nextBlink) { eyes.scale.y = 0.1; if (t > nextBlink + 0.12) { eyes.scale.y = 1; nextBlink = t + 2.5 + Math.random() * 3; } }

    // wave (on click and every few seconds)
    if (t > nextIdleWave) { waveStart = t; nextIdleWave = t + 8 + Math.random() * 4; }
    const w = t - waveStart;
    if (w < 1.8) {
      const lift = Math.min(1, w / 0.3) * Math.min(1, (1.8 - w) / 0.3);
      rightArm.rotation.z = 0.12 + lift * (2.5 + Math.sin(w * 14) * 0.3);
    } else {
      rightArm.rotation.z = 0.12 + Math.sin(t * 1.6) * 0.05;
    }
    leftArm.rotation.z = -0.12 - Math.sin(t * 1.6 + 1) * 0.05;

    // reactor, antenna and thruster pulses
    const pulse = 0.85 + Math.sin(t * 4) * 0.15;
    core.scale.setScalar(pulse);
    coreGlow.material.opacity = 0.6 + Math.sin(t * 4) * 0.25;
    coreRing.rotation.z = -t * 2;
    antennaGlow.material.opacity = 0.5 + Math.sin(t * 5) * 0.4;
    flame.scale.set(1, 0.85 + Math.random() * 0.3, 1);
    (flame.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.random() * 0.15;
    floor.material.opacity = 0.3 - Math.sin(t * 1.6) * 0.08;

    const dt = Math.min(Math.max(t - lastTime, 0), 0.05); // frame-rate independent sparks
    lastTime = t;
    for (let i = 0; i < SPARKS; i++) {
      sparkPos[i * 3 + 1] -= sparkSpeed[i] * dt * 2;
      if (sparkPos[i * 3 + 1] < -2.0) resetSpark(i);
    }
    sparkGeo.attributes.position.needsUpdate = true;

    ringA.rotation.z = t * 0.35;
    ringB.rotation.z = -t * 0.25;
    orbiter.position.set(Math.cos(t * 0.9) * 1.75, Math.sin(t * 0.9) * 1.75 * Math.cos(Math.PI / 2.25), Math.sin(t * 0.9) * 1.75 * Math.sin(Math.PI / 2.25));

    renderer.render(scene, camera);
  };
  render();

  return {
    setPointer: (x, y) => pointer.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))),
    setAlert: (value) => { alert = value; tint(value ? AMBER : CYAN); },
    wave: () => { waveStart = clock.getElapsedTime(); },
    setRunning: (value) => {
      if (value === running) return;
      running = value;
      if (running) render(); else cancelAnimationFrame(frame);
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose()); else material?.dispose();
      });
      glowTex.dispose();
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
