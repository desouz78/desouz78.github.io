import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const container = document.getElementById("antenna-scene");

if (!container) {
  throw new Error("Container #antenna-scene not found.");
}

/* =========================================
   1. SCENE SETUP
   ========================================= */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
camera.position.set(8.6, 4.6, 11.2);
camera.lookAt(0.4, 0.2, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

/* =========================================
   2. LIGHTING
   ========================================= */

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
   3. MATERIALS
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
  emissiveIntensity: 2.2,
  metalness: 0.15,
  roughness: 0.3
});

const waveMaterialA = new THREE.MeshBasicMaterial({
  color: 0x5aa2ff,
  transparent: true,
  opacity: 0.35
});

const waveMaterialB = new THREE.MeshBasicMaterial({
  color: 0xff8748,
  transparent: true,
  opacity: 0.45
});

/* =========================================
   4. ROOT GROUP
   ========================================= */

const antenna = new THREE.Group();
scene.add(antenna);

/* =========================================
   5. HELPERS
   ========================================= */

function rod(start, end, radius, material, radialSegments = 16) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(b, a);
  const length = direction.length();

  const geometry = new THREE.CylinderGeometry(
    radius,
    radius,
    length,
    radialSegments
  );

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);

  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  antenna.add(mesh);
  return mesh;
}

function sphere(position, radius, material) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20),
    material
  );
  mesh.position.set(...position);
  antenna.add(mesh);
  return mesh;
}

function box(size, position, material) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    material
  );
  mesh.position.set(...position);
  antenna.add(mesh);
  return mesh;
}

function torus(position, radius, tube, rotation, material) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 18, 80),
    material
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  antenna.add(mesh);
  return mesh;
}

function tubeFromCurve(curve, radius, material, tubularSegments = 120) {
  const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, 10, false);
  const mesh = new THREE.Mesh(geometry, material);
  antenna.add(mesh);
  return mesh;
}

/* =========================================
   6. STRUCTURE
   ========================================= */

/* Mast */
rod([0, -2.8, -0.1], [0, -0.15, -0.1], 0.12, darkMetal, 18);
rod([0, -3.35, -0.1], [0, -2.8, -0.1], 0.18, graphite, 18);

/* Main boom */
rod([-0.1, 0.1, -3.6], [0.35, 0.25, 3.2], 0.075, darkMetal, 18);

/* Secondary boom for structural richness */
rod([-0.08, -0.12, -3.45], [0.32, 0.02, 3.0], 0.04, silverSoft, 14);

/* Mount / hub */
box([0.55, 0.34, 0.52], [0.03, -0.08, -0.05], graphite);
sphere([0.15, 0.03, 0.4], 0.06, orangeGlow);

/* Support braces */
rod([0, -1.55, -0.1], [0.18, 0.08, 0.95], 0.03, silverSoft, 12);
rod([0, -1.55, -0.1], [0.18, 0.08, -1.05], 0.03, silverSoft, 12);
rod([0, -1.2, -0.1], [0.21, 0.12, 2.0], 0.026, silverSoft, 12);
rod([0, -1.2, -0.1], [0.14, 0.02, -2.0], 0.026, silverSoft, 12);

/* Small clamps along boom */
for (let z = -2.6; z <= 2.4; z += 0.72) {
  box([0.12, 0.08, 0.08], [0.12, 0.15, z], graphite);
}

/* =========================================
   7. REFLECTOR GRID
   ========================================= */

const reflectorZ = -3.0;
const reflectorW = 1.65;
const reflectorH = 1.9;

/* Frame */
rod([-reflectorW / 2, -reflectorH / 2, reflectorZ], [reflectorW / 2, -reflectorH / 2, reflectorZ], 0.022, silverSoft, 12);
rod([-reflectorW / 2, reflectorH / 2, reflectorZ], [reflectorW / 2, reflectorH / 2, reflectorZ], 0.022, silverSoft, 12);
rod([-reflectorW / 2, -reflectorH / 2, reflectorZ], [-reflectorW / 2, reflectorH / 2, reflectorZ], 0.022, silverSoft, 12);
rod([reflectorW / 2, -reflectorH / 2, reflectorZ], [reflectorW / 2, reflectorH / 2, reflectorZ], 0.022, silverSoft, 12);

/* Mesh lines */
for (let x = -0.65; x <= 0.65; x += 0.18) {
  rod([x, -0.88, reflectorZ], [x, 0.88, reflectorZ], 0.008, silver, 8);
}
for (let y = -0.72; y <= 0.72; y += 0.18) {
  rod([-0.72, y, reflectorZ], [0.72, y, reflectorZ], 0.008, silver, 8);
}

/* Reflector supports */
rod([0.05, 0.1, -2.2], [-0.62, 0.7, reflectorZ], 0.02, silverSoft, 10);
rod([0.05, 0.1, -2.2], [-0.62, -0.7, reflectorZ], 0.02, silverSoft, 10);
rod([0.05, 0.1, -2.2], [0.62, 0.7, reflectorZ], 0.02, silverSoft, 10);
rod([0.05, 0.1, -2.2], [0.62, -0.7, reflectorZ], 0.02, silverSoft, 10);

/* =========================================
   8. DRIVEN ELEMENT
   ========================================= */

const feedZ = -1.95;

/* Folded dipole look */
torus([0.12, 0.15, feedZ], 0.42, 0.018, [Math.PI / 2, 0, 0], silver);
rod([-0.42, 0.15, feedZ], [-0.18, 0.15, feedZ], 0.018, silver, 10);
rod([0.42, 0.15, feedZ], [0.18, 0.15, feedZ], 0.018, silver, 10);

/* Cross-polarized inner element */
rod([-0.35, 0.15, feedZ], [0.35, 0.15, feedZ], 0.016, silverSoft, 10);
rod([0.12, -0.2, feedZ], [0.12, 0.5, feedZ], 0.016, silverSoft, 10);

/* Feed detail */
sphere([0.12, 0.15, feedZ], 0.045, orangeGlow);
rod([0.12, -0.05, feedZ], [0.02, -0.48, -1.45], 0.012, orangeGlow, 8);

/* =========================================
   9. DIRECTORS
   ========================================= */

function addDirector(z, lengthX, lengthY, thickness = 0.018) {
  rod([-lengthX / 2, 0.15, z], [lengthX / 2, 0.15, z], thickness, silver, 10);
  rod([0.12, -lengthY / 2, z], [0.12, lengthY / 2, z], thickness, silver, 10);
  box([0.08, 0.06, 0.06], [0.12, 0.15, z], graphite);
}

/* First directors, slightly larger */
let z = -1.35;
let lenX = 1.08;
let lenY = 1.18;

for (let i = 0; i < 14; i++) {
  addDirector(z, lenX, lenY, i < 4 ? 0.02 : 0.017);
  z += 0.34;
  lenX -= 0.03;
  lenY -= 0.035;
}

/* Extra front parasitic tips for a richer silhouette */
for (let i = 0; i < 3; i++) {
  const frontZ = 3.0 + i * 0.26;
  rod([-0.24 + i * 0.01, 0.15, frontZ], [0.48 - i * 0.02, 0.15, frontZ], 0.012, silverSoft, 8);
  rod([0.12, -0.28 + i * 0.01, frontZ], [0.12, 0.42 - i * 0.02, frontZ], 0.012, silverSoft, 8);
}


/* =========================================
   10. DIRECTIONAL RADIATION FIELD
   ========================================= */

// Radiation follows the antenna's local coordinate system.
const radiation = new THREE.Group();
radiation.position.set(0.12, 0.15, feedZ);
antenna.add(radiation);

const wavefronts = [];
const waveColors = [0xff6835, 0xff8749, 0xffad69];

// Approximate directional radiation pattern.
// Main lobe points toward the directors (+Z).
function radiationPattern(theta) {
  const c = Math.cos(theta);
  const main = Math.pow(Math.max(0, c), 6);
  const side = 0.085 * Math.pow(Math.sin(4 * theta), 2) * Math.pow(Math.sin(theta), 2);
  const back = 0.045 * Math.pow(Math.max(0, -c), 4);

  return 0.025 + main + side + back;
}

// Point on the three-dimensional radiation envelope.
function fieldPoint(theta, phi) {
  const radius = radiationPattern(theta);
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
}

// Build a thin electromagnetic field line.
function fieldLine(points, material) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, material);
}

// Multiple wavefronts propagate outward continuously.
for (let i = 0; i < 12; i++) {
  const shell = new THREE.Group();

  const material = new THREE.LineBasicMaterial({
    color: waveColors[i % waveColors.length],
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  // Meridians reveal the directional lobe geometry.
  for (let j = 0; j < 16; j++) {
    const phi = (j / 16) * Math.PI * 2;

    const points = Array.from({ length: 100 }, (_, k) => {
      const theta = (k / 99) * Math.PI;
      return fieldPoint(theta, phi);
    });

    shell.add(fieldLine(points, material));
  }

  // Wavefront contours add density and depth.
  const contours = [0.16, 0.3, 0.45, 0.65, 0.85, 1.1, 1.4, 2.65];

  for (const theta of contours) {
    const points = Array.from({ length: 121 }, (_, k) => {
      const phi = (k / 120) * Math.PI * 2;
      return fieldPoint(theta, phi);
    });

    shell.add(fieldLine(points, material));
  }

  radiation.add(shell);
  wavefronts.push({ shell, material, offset: i / 12 });
}





/* =========================================
   11. ORIENTATION
   ========================================= */

antenna.rotation.y = -0.78;
antenna.rotation.x = -0.08;
antenna.position.set(0.15, -0.2, 0);
antenna.scale.setScalar(0.96);


/* =========================================
   12. DRAG-TO-ROTATE INTERACTION
   ========================================= */

const canvas = renderer.domElement;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let isDragging = false;
let previousX = 0;
let previousY = 0;

let targetRotationX = antenna.rotation.x;
let targetRotationY = antenna.rotation.y;

// Invisible interaction area around the antenna
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

// Start rotating only when clicking the antenna
canvas.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  const rect = canvas.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  if (raycaster.intersectObject(hitbox).length === 0) return;

  isDragging = true;
  previousX = event.clientX;
  previousY = event.clientY;

  canvas.setPointerCapture(event.pointerId);
  canvas.style.cursor = "grabbing";
});

// Rotate while dragging
canvas.addEventListener("pointermove", (event) => {
  if (!isDragging) return;

  const deltaX = event.clientX - previousX;
  const deltaY = event.clientY - previousY;

  targetRotationY += deltaX * 0.006;

  targetRotationX = THREE.MathUtils.clamp(targetRotationX + deltaY * 0.005, -0.55, 0.55);

  previousX = event.clientX;
  previousY = event.clientY;
});

// Stop rotating when released
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
   13. RESIZE
   ========================================= */

function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();

/* =========================================
   14. ANIMATION
   ========================================= */

const clock = new THREE.Clock();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Smooth drag-to-rotate interaction
  antenna.rotation.y = THREE.MathUtils.lerp(antenna.rotation.y, targetRotationY, reduceMotion ? 1 : 0.12);
  antenna.rotation.x = THREE.MathUtils.lerp(antenna.rotation.x, targetRotationX, reduceMotion ? 1 : 0.12);

  // Expanding directional wavefronts
  for (const { shell, material, offset } of wavefronts) {
    const progress = reduceMotion ? offset : (offset + t * 0.12) % 1;
    const distance = 0.25 + progress * 10.5;

    shell.scale.setScalar(distance);
    material.opacity = reduceMotion ? 0.16 : 0.52 * Math.sin(Math.PI * progress);
  }

  renderer.render(scene, camera);
}

animate();
