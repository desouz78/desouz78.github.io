
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const viewport = document.getElementById("instrument-scene");
const shell = viewport?.closest(".scope-shell");
const anchor = document.getElementById("hands-on-anchor");
const detailName = document.getElementById("instrument-project-name");
const detailText = document.getElementById("instrument-project-description");
const detailLink = document.getElementById("instrument-project-link");
const detailChannel = document.getElementById("instrument-project-channel");

if (!viewport || !shell || !anchor) throw new Error("Instrument elements not found.");

const projects = [
  { channel: "CH 01 / AUDIO", name: "Speech Enhancement Lab", description: "Experiments in speech enhancement, audio analysis, and pretrained models.", url: "https://github.com/desouz78/speech-enhancement-lab" },
  { channel: "CH 02 / DATA NETWORKS", name: "Brazilian Rural Connectivity", description: "Graph-based exploration of connectivity across Brazilian rural schools.", url: "https://github.com/desouz78/Final-Project---Big-Data-Tools-and-Techniques" },
  { channel: "CH 03 / RESEARCH", name: "Wireless Sensing & Simulation", description: "Research experiments under development. Source code is not publicly available.", url: "" },
  { channel: "CH 04 / STANDBY", name: "Still on the workbench", description: "An open channel for experiments worth sharing later.", url: "" }
];

/* =========================================
   SCENE, CAMERA AND LIGHTING
   ========================================= */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
camera.position.set(0, 0.1, 16.7);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xa7b9cb, 2.1));

const key = new THREE.DirectionalLight(0xf5f9ff, 4.6);
key.position.set(-5, 8, 12);
scene.add(key);

const fill = new THREE.DirectionalLight(0x6e9bc9, 2.6);
fill.position.set(8, -2, 8);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffb17d, 1.2);
rim.position.set(4, 3, -6);
scene.add(rim);

/* =========================================
   MATERIALS AND GEOMETRY
   ========================================= */

const model = new THREE.Group();
model.rotation.set(-0.055, -0.18, 0);
scene.add(model);

const finish = (color, metalness = 0.75, roughness = 0.38) => new THREE.MeshStandardMaterial({ color, metalness, roughness });

const graphite = finish(0x172432, 0.78, 0.46);
const alloy = finish(0x63778c, 0.89, 0.28);
const brushed = finish(0x35485b, 0.76, 0.38);
const dark = finish(0x080f19, 0.36, 0.65);
const glass = new THREE.MeshPhysicalMaterial({ color: 0x0b1b2a, metalness: 0.15, roughness: 0.15, clearcoat: 0.95, clearcoatRoughness: 0.12 });
const led = new THREE.MeshStandardMaterial({ color: 0xff9553, emissive: 0xff6e26, emissiveIntensity: 1.8 });

function box(w, h, d, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  model.add(mesh);
  return mesh;
}

function cylinder(radius, depth, x, y, z, material, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, z);
  model.add(mesh);
  return mesh;
}

function addText(text, x, y, w, h, size = 34, color = "#d2deeb") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px Arial`;
  ctx.fillText(text, 10, 79);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
  mesh.position.set(x, y, 0.90);
  model.add(mesh);
}

/* =========================================
   INSTRUMENT CHASSIS
   ========================================= */

box(10.5, 5.75, 1.15, 0, 0, -0.35, graphite);
box(10.5, 0.12, 1.18, 0, 2.81, -0.34, alloy);
box(10.5, 0.12, 1.18, 0, -2.81, -0.34, brushed);
box(10.29, 5.55, 0.13, 0, 0, 0.28, alloy);
box(10.14, 5.40, 0.13, 0, 0, 0.38, brushed);
box(7.55, 4.27, 0.14, -1.21, 0.12, 0.50, dark);
box(7.27, 4.01, 0.07, -1.21, 0.12, 0.59, glass);
box(2.18, 4.27, 0.10, 3.78, 0.12, 0.51, graphite);
box(9.87, 0.75, 0.07, 0, -2.28, 0.53, graphite);

for (const x of [-5.0, 5.0]) for (const y of [-2.63, 2.63]) cylinder(0.052, 0.06, x, y, 0.48, alloy, 12);
for (let i = 0; i < 13; i++) box(0.23, 0.035, 0.04, -4.72 + i * 0.77, 2.65, 0.49, dark);

addText("LS / SIGNAL ANALYSIS WORKBENCH", -3.48, 2.40, 3.28, 0.22, 42);
addText("LS-4004 MULTI-PROJECT MONITOR", 2.86, 2.40, 2.75, 0.22, 31, "#a5b6c9");

/* =========================================
   FOUR INSTRUMENT DISPLAYS
   ========================================= */

function screenTexture(project, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#050e1a";
  ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = "rgba(90,140,175,0.15)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= 1024; x += 51) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
  for (let y = 0; y <= 512; y += 51) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke(); }

  ctx.fillStyle = "#98b3c9";
  ctx.font = "27px monospace";
  ctx.fillText(project.channel, 34, 47);

  ctx.fillStyle = index < 2 ? "#9fc4b3" : "#7c8998";
  ctx.textAlign = "right";
  ctx.fillText(index < 2 ? "PUBLIC" : index === 2 ? "PRIVATE" : "STANDBY", 990, 47);
  ctx.textAlign = "left";

  if (index === 0) {
    ctx.strokeStyle = "#ffa36d"; ctx.lineWidth = 5; ctx.beginPath();
    for (let x = 35; x < 990; x += 3) {
      const amplitude = 7 + 78 * Math.abs(Math.sin(x * 0.019)) * Math.abs(Math.sin(x * 0.004));
      const y = 225 + Math.sin(x * 0.12) * amplitude;
      if (x === 35) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  if (index === 1) {
    const points = [[100,205],[258,135],[350,290],[496,193],[612,112],[735,290],[880,160]];
    ctx.strokeStyle = "#80b3d5"; ctx.lineWidth = 5; ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.stroke();
    for (const [x,y] of points) { ctx.fillStyle = "#f0ab79"; ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.fill(); }
  }

  if (index > 1) {
    ctx.fillStyle = "#63778b"; ctx.font = "35px monospace"; ctx.textAlign = "center";
    ctx.fillText(index === 2 ? "RESEARCH IN PROGRESS" : "AWAITING NEXT EXPERIMENT", 512, 225);
    ctx.textAlign = "left";
  }

  ctx.fillStyle = "#dce7f0";
  ctx.font = "bold 37px Arial";
  ctx.fillText(project.name, 34, 427);
  ctx.fillStyle = "#93a6b8";
  ctx.font = "26px monospace";
  ctx.fillText(index < 2 ? "SELECT CHANNEL TO OPEN" : "INFORMATION ONLY", 34, 473);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

const screenMeshes = [];
const outlines = [];
const positions = [[-3.06, 1.08], [0.55, 1.08], [-3.06, -0.86], [0.55, -0.86]];

projects.forEach((project, index) => {
  const [x, y] = positions[index];
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.38, 1.80), new THREE.MeshBasicMaterial({ map: screenTexture(project, index), toneMapped: false }));
  face.position.set(x, y, 0.665);
  face.userData.projectIndex = index;
  model.add(face);
  screenMeshes.push(face);

  const frame = box(3.49, 1.91, 0.018, x, y, 0.631, finish(0x334b61, 0.55, 0.48));
  outlines.push(frame);
});

/* =========================================
   PHYSICAL CONTROLS AND CONNECTORS
   ========================================= */

for (const [x,y,r] of [[3.75,1.40,0.36],[3.75,0.45,0.28]]) {
  cylinder(r+0.10, 0.11, x, y, 0.66, dark);
  cylinder(r, 0.15, x, y, 0.73, alloy);
  cylinder(r*0.71, 0.17, x, y, 0.82, brushed);
  box(0.025, r*0.48, 0.02, x, y+r*0.44, 0.93, finish(0xe8eff6, 0.15, 0.55));
}

addText("AMPLITUDE", 3.23, 1.96, 1.55, 0.18, 39);
addText("FREQUENCY", 3.23, 0.91, 1.55, 0.18, 39);

for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
  const material = row === 2 && col === 2 ? finish(0x4d8064, 0.25, 0.48) : finish(0x51677b, 0.57, 0.43);
  box(0.52, 0.35, 0.16, 2.97 + col*0.80, -0.33 - row*0.48, 0.70, material);
}

const inputJack = cylinder(0.26, 0.23, -4.84, -2.30, 0.76, alloy);
cylinder(0.17, 0.25, -4.84, -2.30, 0.91, dark);
cylinder(0.055, 0.265, -4.84, -2.30, 1.04, led);

for (const x of [-3.67,-2.57,-1.47,-0.37]) {
  cylinder(0.22, 0.16, x, -2.30, 0.67, alloy);
  cylinder(0.14, 0.19, x, -2.30, 0.80, dark);
}

cylinder(0.065, 0.11, 4.60, 2.38, 0.64, led);

/* =========================================
   PROJECT SELECTION AND ROTATION
   ========================================= */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let selected = 0, dragging = false, moved = false;
let lastX = 0, lastY = 0, startX = 0, startY = 0;
let targetY = -0.18, targetX = -0.055, visible = true, needsRender = true;

function selectProject(index) {
  selected = index;
  const project = projects[index];
  detailChannel.textContent = project.channel;
  detailName.textContent = project.name;
  detailText.textContent = project.description;
  detailLink.hidden = !project.url;
  if (project.url) detailLink.href = project.url;
  outlines.forEach((frame, i) => frame.material.color.setHex(i === index ? 0xb87954 : 0x334b61));
  needsRender = true;
}

function hitTest(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set(2 * (event.clientX - rect.left) / rect.width - 1, 1 - 2 * (event.clientY - rect.top) / rect.height);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(screenMeshes);
  return hits.length ? hits[0].object.userData.projectIndex : null;
}

renderer.domElement.addEventListener("pointerdown", event => {
  if (event.button !== 0) return;
  dragging = true; moved = false;
  startX = lastX = event.clientX;
  startY = lastY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", event => {
  if (!dragging) return;
  const dx = event.clientX - lastX, dy = event.clientY - lastY;
  if (Math.hypot(event.clientX-startX, event.clientY-startY) > 5) moved = true;
  if (moved) {
    targetY = THREE.MathUtils.clamp(targetY + dx*0.006, -0.43, 0.43);
    targetX = THREE.MathUtils.clamp(targetX + dy*0.004, -0.28, 0.28);
    needsRender = true;
  }
  lastX = event.clientX; lastY = event.clientY;
});

renderer.domElement.addEventListener("pointerup", event => {
  if (!dragging) return;
  dragging = false;
  if (!moved) {
    const hit = hitTest(event);
    if (hit !== null) selectProject(hit);
  }
});

renderer.domElement.addEventListener("pointercancel", () => dragging = false);
renderer.domElement.addEventListener("lostpointercapture", () => dragging = false);

/* =========================================
   CABLE CONNECTION AND RENDERING
   ========================================= */

function resize() {
  const rect = viewport.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
  needsRender = true;
}

new ResizeObserver(resize).observe(viewport);

if ("IntersectionObserver" in window) {
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    needsRender = true;
  }, { threshold: 0.01 }).observe(viewport);
}

function updateCableAnchor() {
  const rect = viewport.getBoundingClientRect();
  const point = inputJack.getWorldPosition(new THREE.Vector3()).project(camera);
  anchor.style.left = `${(point.x+1)*rect.width/2}px`;
  anchor.style.top = `${(1-point.y)*rect.height/2}px`;
}

function animate() {
  requestAnimationFrame(animate);
  if (!visible) return;

  const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0.14;
  const difference = Math.abs(model.rotation.y-targetY) + Math.abs(model.rotation.x-targetX);

  if (difference > 0.0005) {
    model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, targetY, speed);
    model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, targetX, speed);
    needsRender = true;
  }

  if (needsRender) {
    model.updateMatrixWorld(true);
    updateCableAnchor();
    renderer.render(scene, camera);
    needsRender = false;
  }
}

resize();
shell.classList.add("instrument-ready");
selectProject(0);
animate();
