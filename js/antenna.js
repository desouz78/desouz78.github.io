
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const container = document.getElementById("antenna-scene");
const overlay = document.getElementById("hero-radiation");

if (!container || !overlay) {
  throw new Error("Homepage antenna containers not found.");
}

/* =========================================
   1. SCENE AND CAMERA
   ========================================= */

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-6, 6, 4.7, -4.7, 0.1, 250);

const center = new THREE.Vector3(0.4, 0.2, 0);
const viewingAxis = new THREE.Vector3(8.2, 4.4, 11.2).normalize();

camera.position.copy(center).addScaledVector(viewingAxis, 120);
camera.lookAt(center);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.style.pointerEvents = "none";

overlay.appendChild(renderer.domElement);

// Lighting
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

// Mast and longitudinal booms
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

// Reflector at -Z
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

antenna.rotation.y = 0.10;
antenna.rotation.x = 0.05;
antenna.position.set(0.15, -0.2, 0);
antenna.scale.setScalar(0.96);

/* =========================================
   4. QUALITATIVE YAGI DIRECTIVITY
   ========================================= */

// +Z points toward the directors.
// This is an illustrative gain envelope, not an exact EM simulation.
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

// All expanding shells share the same 3D geometry.
const vertices = [];

function addSegment(a, b) {
  vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
}

// Meridians
for (let m = 0; m < 16; m++) {
  const phi = m * Math.PI * 2 / 16;

  for (let k = 0; k < 80; k++) {
    addSegment(envelopePoint(k * Math.PI / 80, phi), envelopePoint((k + 1) * Math.PI / 80, phi));
  }
}

// Radiation envelope contours
for (const theta of [0.16, 0.25, 0.36, 0.50, 0.67, 0.85, 1.12, 1.4, 1.9, 2.4, 2.85]) {
  for (let k = 0; k < 96; k++) {
    addSegment(envelopePoint(theta, k * Math.PI * 2 / 96), envelopePoint(theta, (k + 1) * Math.PI * 2 / 96));
  }
}

const radiationGeometry = new THREE.BufferGeometry();
radiationGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
radiationGeometry.computeBoundingSphere();

const wavefronts = [];
const WAVE_COUNT = 32;

for (let i = 0; i < WAVE_COUNT; i++) {
  const material = new THREE.LineBasicMaterial({
    color: i % 5 === 0 ? 0xffae71 : i % 2 ? 0xff763c : 0xff5426,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const shell = new THREE.LineSegments(radiationGeometry, material);
  shell.frustumCulled = false;
  radiation.add(shell);

  wavefronts.push({
    shell,
    material,
    offset: i / WAVE_COUNT
  });
}

/* =========================================
   5. DRAG TO ROTATE
   ========================================= */

const canvas = container;
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

  const rect = renderer.domElement.getBoundingClientRect();

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
   6. RESPONSIVE CAMERA
   ========================================= */

function resize() {
  const overlayRect = overlay.getBoundingClientRect();
  const visualRect = container.getBoundingClientRect();

  if (overlayRect.width < 1 || overlayRect.height < 1) return;

  const aspect = overlayRect.width / overlayRect.height;
  const visibleHeight = 9.4;
  const visibleWidth = visibleHeight * aspect;

  camera.left = -visibleWidth / 2;
  camera.right = visibleWidth / 2;
  camera.top = visibleHeight / 2;
  camera.bottom = -visibleHeight / 2;

  // Keep the antenna at the center of the right-hand column.
  // Camera is positioned far away to avoid near-plane clipping.
  camera.position.copy(center).addScaledVector(viewingAxis, 120);
  camera.lookAt(center);
  camera.updateMatrixWorld(true);

  const x = (visualRect.left + visualRect.width / 2 - overlayRect.left) / overlayRect.width;
  const y = (visualRect.top + visualRect.height / 2 - overlayRect.top) / overlayRect.height;

  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

  camera.position.addScaledVector(right, -(x - 0.5) * visibleWidth);
  camera.position.addScaledVector(up, (y - 0.5) * visibleHeight);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);

  renderer.setSize(overlayRect.width, overlayRect.height);
}

window.addEventListener("resize", resize);
resize();

/* =========================================
   7. ANIMATION
   ========================================= */

const clock = new THREE.Clock();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  antenna.rotation.y = THREE.MathUtils.lerp(antenna.rotation.y, targetRotationY, reduceMotion ? 1 : 0.12);
  antenna.rotation.x = THREE.MathUtils.lerp(antenna.rotation.x, targetRotationX, reduceMotion ? 1 : 0.12);

  for (const wave of wavefronts) {
    const progress = reduceMotion ? wave.offset : (wave.offset + time * 0.07) % 1;

    wave.shell.scale.setScalar(0.6 + progress * 34);
    wave.material.opacity = reduceMotion ? 0.035 : 0.19 * Math.pow(Math.sin(Math.PI * progress), 1.2);
  }

  renderer.render(scene, camera);
}

animate();


// Expose the real 3D position of the mast's lower connector.

window.getAntennaCableAnchor = () => {
  antenna.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);

  const rect = renderer.domElement.getBoundingClientRect();

  function projectPoint(localY) {
    const point = antenna.localToWorld(
      new THREE.Vector3(0, localY, -0.1)
    ).project(camera);

    return {
      x: rect.left + (point.x + 1) * rect.width / 2,
      y: rect.top + (1 - point.y) * rect.height / 2
    };
  }

  const inside = projectPoint(-2.95);
  const outside = projectPoint(-3.60);

  return {
    x: inside.x,
    y: inside.y,
    exitX: outside.x,
    exitY: outside.y
  };
};

window.dispatchEvent(new Event("antenna-cable-ready"));
