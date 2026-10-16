
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const container = document.getElementById("antenna-scene");
const hero = document.getElementById("home");
const overlay = document.getElementById("hero-radiation");

if (!container || !hero || !overlay) {
  throw new Error("Homepage antenna containers not found.");
}

/* =========================================
   1. SCENE AND CAMERA
   ========================================= */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

camera.position.set(8.6, 4.6, 11.2);
camera.lookAt(0.4, 0.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xaec3dd, 2.1));

const keyLight = new THREE.DirectionalLight(0xeaf4ff, 4.2);
keyLight.position.set(7, 10, 8);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x86a8cf, 2.0);
fillLight.position.set(-6, 3, 7);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xff8a4b, 2.8);
rimLight.position.set(-8, 4, -5);
scene.add(rimLight);

/* =========================================
   2. MATERIALS AND HELPERS
   ========================================= */

const silver = new THREE.MeshStandardMaterial({
  color: 0xc5d2e1,
  metalness: 0.9,
  roughness: 0.24
});

const silverSoft = new THREE.MeshStandardMaterial({
  color: 0xaebdd0,
  metalness: 0.82,
  roughness: 0.3
});

const darkMetal = new THREE.MeshStandardMaterial({
  color: 0x2d3d50,
  metalness: 0.82,
  roughness: 0.42
});

const graphite = new THREE.MeshStandardMaterial({
  color: 0x172434,
  metalness: 0.55,
  roughness: 0.65
});

const orangeGlow = new THREE.MeshStandardMaterial({
  color: 0xff8d4d,
  emissive: 0xff6323,
  emissiveIntensity: 2.2
});

const antenna = new THREE.Group();
scene.add(antenna);

function rod(start, end, radius, material, segments = 12) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = b.clone().sub(a);

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), segments),
    material
  );

  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  antenna.add(mesh);

  return mesh;
}

function box(size, position, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  antenna.add(mesh);
  return mesh;
}

function sphere(position, radius, material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 20), material);
  mesh.position.set(...position);
  antenna.add(mesh);
  return mesh;
}

/* =========================================
   3. ANTENNA GEOMETRY
   ========================================= */

// Mast, booms and mounting hub
rod([0, -2.8, -0.1], [0, -0.15, -0.1], 0.12, darkMetal, 18);
rod([0, -3.35, -0.1], [0, -2.8, -0.1], 0.18, graphite, 18);

rod([-0.1, 0.1, -3.6], [0.35, 0.25, 3.2], 0.075, darkMetal, 18);
rod([-0.08, -0.12, -3.45], [0.32, 0.02, 3.0], 0.04, silverSoft);

box([0.55, 0.34, 0.52], [0.03, -0.08, -0.05], graphite);
sphere([0.15, 0.03, 0.4], 0.06, orangeGlow);

// Structural braces
for (const z of [-1.05, 0.95]) {
  rod([0, -1.55, -0.1], [0.18, 0.08, z], 0.03, silverSoft);
}

rod([0, -1.2, -0.1], [0.21, 0.12, 2], 0.026, silverSoft);
rod([0, -1.2, -0.1], [0.14, 0.02, -2], 0.026, silverSoft);

for (let z = -2.6; z <= 2.4; z += 0.72) {
  box([0.12, 0.08, 0.08], [0.12, 0.15, z], graphite);
}

// Reflector at -Z; directors point toward +Z
const reflectorZ = -3.0;
const reflectorW = 1.65;
const reflectorH = 1.9;

rod([-reflectorW / 2, -reflectorH / 2, reflectorZ], [reflectorW / 2, -reflectorH / 2, reflectorZ], 0.022, silverSoft);
rod([-reflectorW / 2, reflectorH / 2, reflectorZ], [reflectorW / 2, reflectorH / 2, reflectorZ], 0.022, silverSoft);
rod([-reflectorW / 2, -reflectorH / 2, reflectorZ], [-reflectorW / 2, reflectorH / 2, reflectorZ], 0.022, silverSoft);
rod([reflectorW / 2, -reflectorH / 2, reflectorZ], [reflectorW / 2, reflectorH / 2, reflectorZ], 0.022, silverSoft);

for (let x = -0.65; x <= 0.65; x += 0.18) {
  rod([x, -0.88, reflectorZ], [x, 0.88, reflectorZ], 0.008, silver, 8);
}

for (let y = -0.72; y <= 0.72; y += 0.18) {
  rod([-0.72, y, reflectorZ], [0.72, y, reflectorZ], 0.008, silver, 8);
}

for (const x of [-0.62, 0.62]) {
  for (const y of [-0.7, 0.7]) {
    rod([0.05, 0.1, -2.2], [x, y, reflectorZ], 0.02, silverSoft);
  }
}

// Simplified driven element
const feedZ = -1.95;

const folded = new THREE.Mesh(
  new THREE.TorusGeometry(0.42, 0.018, 18, 80),
  silver
);

folded.position.set(0.12, 0.15, feedZ);
folded.rotation.x = Math.PI / 2;
antenna.add(folded);

rod([-0.42, 0.15, feedZ], [-0.18, 0.15, feedZ], 0.018, silver);
rod([0.42, 0.15, feedZ], [0.18, 0.15, feedZ], 0.018, silver);
rod([-0.35, 0.15, feedZ], [0.35, 0.15, feedZ], 0.016, silverSoft);
rod([0.12, -0.2, feedZ], [0.12, 0.5, feedZ], 0.016, silverSoft);

sphere([0.12, 0.15, feedZ], 0.045, orangeGlow);
rod([0.12, -0.05, feedZ], [0.02, -0.48, -1.45], 0.012, orangeGlow, 8);

// Crossed director elements
for (let i = 0; i < 14; i++) {
  const z = -1.35 + i * 0.34;
  const lengthX = 1.08 - i * 0.03;
  const lengthY = 1.18 - i * 0.035;

  rod([-lengthX / 2, 0.15, z], [lengthX / 2, 0.15, z], i < 4 ? 0.02 : 0.017, silver, 10);
  rod([0.12, -lengthY / 2, z], [0.12, lengthY / 2, z], i < 4 ? 0.02 : 0.017, silver, 10);

  box([0.08, 0.06, 0.06], [0.12, 0.15, z], graphite);
}

for (let i = 0; i < 3; i++) {
  const z = 3 + i * 0.26;

  rod([-0.24 + i * 0.01, 0.15, z], [0.48 - i * 0.02, 0.15, z], 0.012, silverSoft, 8);
  rod([0.12, -0.28 + i * 0.01, z], [0.12, 0.42 - i * 0.02, z], 0.012, silverSoft, 8);
}

antenna.rotation.y = -0.78;
antenna.rotation.x = -0.08;
antenna.position.set(0.15, -0.2, 0);
antenna.scale.setScalar(0.96);

/* =========================================
   4. QUALITATIVE YAGI RADIATION PATTERN
   ========================================= */

// Shared angular envelope for 3D and SVG wavefronts.
// Illustrative directional pattern, not an EM simulation.

function radiationPattern(theta) {
  const main = 0.94 * Math.exp(-0.5 * (theta / 0.55) ** 2);
  const side1 = 0.095 * Math.exp(-0.5 * ((theta - 1.18) / 0.20) ** 2);
  const side2 = 0.045 * Math.exp(-0.5 * ((theta - 1.92) / 0.18) ** 2);
  const back = 0.065 * Math.exp(-0.5 * ((theta - Math.PI) / 0.31) ** 2);

  return 0.018 + main + side1 + side2 + back;
}

function envelopePoint(theta, phi) {
  const r = radiationPattern(theta);

  return new THREE.Vector3(
    r * Math.sin(theta) * Math.cos(phi),
    r * Math.sin(theta) * Math.sin(phi),
    r * Math.cos(theta)
  );
}

const radiation = new THREE.Group();
radiation.position.set(0.12, 0.15, feedZ);
antenna.add(radiation);

const nearWavefronts = [];

// Subtle 3D wavefronts surrounding the antenna
for (let i = 0; i < 5; i++) {
  const group = new THREE.Group();

  const material = new THREE.LineBasicMaterial({
    color: i % 2 ? 0xff8a48 : 0xff6434,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  for (let meridian = 0; meridian < 9; meridian++) {
    const phi = meridian * Math.PI / 9;

    const points = Array.from({ length: 95 }, (_, k) => {
      return envelopePoint(k * Math.PI / 94, phi);
    });

    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  for (const theta of [0.25, 0.47, 0.72, 1.15, 1.9, 2.85]) {
    const points = Array.from({ length: 97 }, (_, k) => {
      return envelopePoint(theta, k * Math.PI * 2 / 96);
    });

    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
  }

  radiation.add(group);
  nearWavefronts.push({ group, material, offset: i / 5 });
}

/* =========================================
   5. FULL-HERO SVG WAVEFRONTS
   ========================================= */

const svgNS = "http://www.w3.org/2000/svg";
const heroWavefronts = [];

for (let i = 0; i < 22; i++) {
  const path = document.createElementNS(svgNS, "path");

  path.setAttribute("fill", "none");
  path.setAttribute("stroke", i % 4 === 0 ? "#ffa064" : i % 3 === 0 ? "#ff8846" : "#ff6735");
  path.setAttribute("stroke-width", i % 4 === 0 ? "1.25" : "0.8");
  path.setAttribute("vector-effect", "non-scaling-stroke");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("opacity", "0");

  overlay.appendChild(path);
  heroWavefronts.push({ path, offset: i / 22 });
}

// Convert 3D world coordinates into coordinates relative to the hero section.
function projectToHero(worldPoint, canvasRect, heroRect) {
  const p = worldPoint.clone().project(camera);

  return {
    x: canvasRect.left - heroRect.left + (p.x + 1) * canvasRect.width / 2,
    y: canvasRect.top - heroRect.top + (1 - p.y) * canvasRect.height / 2
  };
}

let previousScreenDirection = new THREE.Vector2(-1, 0);
let overlaySize = "";

function updateHeroRadiation(time, reduceMotion) {
  const heroRect = hero.getBoundingClientRect();
  const canvasRect = renderer.domElement.getBoundingClientRect();

  if (heroRect.width < 1 || heroRect.height < 1 || canvasRect.width < 1 || canvasRect.height < 1) {
    return;
  }

  const size = `${heroRect.width} ${heroRect.height}`;

  if (size !== overlaySize) {
    overlay.setAttribute("viewBox", `0 0 ${size}`);
    overlaySize = size;
  }

  antenna.updateMatrixWorld(true);

  // Feed point and antenna axes in world space
  const feed = antenna.localToWorld(new THREE.Vector3(0.12, 0.15, feedZ));
  const forwardTip = antenna.localToWorld(new THREE.Vector3(0.12, 0.15, feedZ + 2.4));
  const rightTip = antenna.localToWorld(new THREE.Vector3(1.2, 0.15, feedZ));
  const upTip = antenna.localToWorld(new THREE.Vector3(0.12, 1.2, feedZ));

  const origin = projectToHero(feed, canvasRect, heroRect);
  const forward2D = projectToHero(forwardTip, canvasRect, heroRect);
  const right2D = projectToHero(rightTip, canvasRect, heroRect);
  const up2D = projectToHero(upTip, canvasRect, heroRect);

  // Screen-space forward direction
  const dir2D = new THREE.Vector2(forward2D.x - origin.x, forward2D.y - origin.y);

  if (dir2D.lengthSq() > 16) {
    previousScreenDirection.copy(dir2D).normalize();
  }

  const direction = previousScreenDirection.clone();
  const perpendicular = new THREE.Vector2(-direction.y, direction.x);

  // World-space forward direction
  const forwardWorld = forwardTip.clone().sub(feed).normalize();
  const toCamera = camera.position.clone().sub(feed).normalize();

  // 0 => side view, 1 => pointing toward/away from camera
  const facingAmount = THREE.MathUtils.smoothstep(
    Math.abs(forwardWorld.dot(toCamera)),
    0.72,
    0.97
  );

  // Slightly different deformation depending on front/back
  const depthSign = Math.sign(forwardWorld.dot(toCamera)) || 1;

  // Projected local axes for additional stability
  const rightVec2 = new THREE.Vector2(right2D.x - origin.x, right2D.y - origin.y);
  const upVec2 = new THREE.Vector2(up2D.x - origin.x, up2D.y - origin.y);

  const axisMix = rightVec2.lengthSq() > upVec2.lengthSq()
    ? rightVec2.clone().normalize()
    : upVec2.clone().normalize();

  const maxRadius = Math.max(heroRect.width, heroRect.height) * 1.55;

  for (const wave of heroWavefronts) {
    const progress = reduceMotion ? wave.offset : (wave.offset + time * 0.10) % 1;
    const distance = 20 + progress * maxRadius;
    const fade = Math.pow(Math.sin(Math.PI * progress), 1.18);

    const points = [];

    for (let j = 0; j <= 220; j++) {
      const angle = -Math.PI + j * ((2 * Math.PI) / 220);

      // theta = 0 along main lobe, theta = pi to the back
      const theta = Math.abs(angle);
      const gain = radiationPattern(theta);

      // SIDE VIEW MODEL (directional on screen)
      const parallel = Math.cos(angle) * gain * distance;
      const lateral = Math.sin(angle) * gain * distance * 0.92;

      const xSide = origin.x + direction.x * parallel + perpendicular.x * lateral;
      const ySide = origin.y + direction.y * parallel + perpendicular.y * lateral;

      // FRONT/BACK VIEW MODEL
      // When looking almost along the antenna axis, the screen projection
      // should become more circular / concentric rather than “stretched”.
      const circularScaleX = 0.82 + 0.18 * Math.cos(angle * 2);
      const circularScaleY = 0.82 + 0.18 * Math.sin(angle * 2);

      const frontRadius = gain * distance;

      const xFront =
        origin.x +
        Math.cos(angle) * frontRadius * circularScaleX +
        axisMix.x * Math.sin(angle) * frontRadius * 0.18 * depthSign;

      const yFront =
        origin.y +
        Math.sin(angle) * frontRadius * circularScaleY +
        axisMix.y * Math.sin(angle) * frontRadius * 0.18 * depthSign;

      // Blend between side view and front/back view
      const x = THREE.MathUtils.lerp(xSide, xFront, facingAmount);
      const y = THREE.MathUtils.lerp(ySide, yFront, facingAmount);

      points.push(`${j === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }

    wave.path.setAttribute("d", points.join(" ") + " Z");
    wave.path.setAttribute("opacity", (reduceMotion ? 0.10 : 0.34 * fade).toFixed(3));
  }
}

/* =========================================
   6. DRAG TO ROTATE
   ========================================= */

const canvas = renderer.domElement;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let isDragging = false;
let previousX = 0;
let previousY = 0;
let targetRotationX = antenna.rotation.x;
let targetRotationY = antenna.rotation.y;

const hitbox = new THREE.Mesh(
  new THREE.BoxGeometry(4.2, 5.2, 10.5),
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    colorWrite: false,
    depthWrite: false
  })
);

hitbox.position.set(0, -0.3, 0);
antenna.add(hitbox);

canvas.style.cursor = "grab";
canvas.style.touchAction = "none";

canvas.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  const rect = canvas.getBoundingClientRect();

  pointer.x = 2 * (event.clientX - rect.left) / rect.width - 1;
  pointer.y = 1 - 2 * (event.clientY - rect.top) / rect.height;

  raycaster.setFromCamera(pointer, camera);
  if (!raycaster.intersectObject(hitbox).length) return;

  isDragging = true;
  previousX = event.clientX;
  previousY = event.clientY;

  canvas.setPointerCapture(event.pointerId);
  canvas.style.cursor = "grabbing";
});

canvas.addEventListener("pointermove", (event) => {
  if (!isDragging) return;

  targetRotationY += (event.clientX - previousX) * 0.006;
  targetRotationX = THREE.MathUtils.clamp(targetRotationX + (event.clientY - previousY) * 0.005, -0.55, 0.55);

  previousX = event.clientX;
  previousY = event.clientY;
});

function stopDragging(event) {
  isDragging = false;
  canvas.style.cursor = "grab";

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

canvas.addEventListener("pointerup", stopDragging);
canvas.addEventListener("pointercancel", stopDragging);

canvas.addEventListener("lostpointercapture", () => {
  isDragging = false;
  canvas.style.cursor = "grab";
});

/* =========================================
   7. RESIZE AND ANIMATION
   ========================================= */

function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (width < 1 || height < 1) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // Smooth antenna rotation
  antenna.rotation.y = THREE.MathUtils.lerp(antenna.rotation.y, targetRotationY, reduceMotion ? 1 : 0.12);
  antenna.rotation.x = THREE.MathUtils.lerp(antenna.rotation.x, targetRotationX, reduceMotion ? 1 : 0.12);

  // Subtle local 3D radiation
  for (const wave of nearWavefronts) {
    const progress = reduceMotion ? wave.offset : (wave.offset + time * 0.14) % 1;

    wave.group.scale.setScalar(0.7 + progress * 6.0);
    wave.material.opacity = reduceMotion ? 0.035 : 0.12 * Math.sin(Math.PI * progress);
  }

  // Full-home directional radiation
  updateHeroRadiation(time, reduceMotion);

  renderer.render(scene, camera);
}

animate();
