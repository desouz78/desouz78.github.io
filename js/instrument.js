import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const viewport = document.getElementById("instrument-scene");
const shell = viewport?.closest(".scope-shell");
const anchor = document.getElementById("hands-on-anchor");
if (!viewport || !shell || !anchor) throw new Error("Instrument elements not found.");

const projects = [
  { channel: "CH 01 / AUDIO", name: "Speech Enhancement Lab", description: ["Speech processing, enhancement and", "experiments with pretrained models."], status: "PUBLIC REPOSITORY", url: "https://github.com/desouz78/speech-enhancement-lab" },
  { channel: "CH 02 / DATA NETWORKS", name: "Brazilian Rural Connectivity", description: ["Graph-based analysis of connectivity", "across Brazilian rural schools."], status: "PUBLIC REPOSITORY", url: "https://github.com/desouz78/Final-Project---Big-Data-Tools-and-Techniques" },
  { channel: "CH 03 / RESEARCH", name: "Wireless Sensing & Simulation", description: ["Ongoing research and simulations.", "Source code is not publicly available."], status: "PRIVATE / IN PROGRESS", url: "" },
  { channel: "CH 04 / STANDBY", name: "Still on the Workbench", description: ["A channel reserved for experiments", "worth sharing in the future."], status: "AWAITING INPUT", url: "" }
];

/* =========================================
   SCENE AND LIGHTING
   ========================================= */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setClearColor(0, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.45;
viewport.appendChild(renderer.domElement);
viewport.setAttribute("role", "group");
viewport.setAttribute("aria-label", "Interactive 3D analyzer. Drag to rotate, click a channel to read project details, press Escape to return.");

scene.add(new THREE.AmbientLight(0xa8bfd8, 2.1));
const key = new THREE.DirectionalLight(0xf7fbff, 4.8); key.position.set(-6, 9, 12); scene.add(key);
const fill = new THREE.DirectionalLight(0x80afd8, 2.3); fill.position.set(9, -3, 5); scene.add(fill);
const rim = new THREE.DirectionalLight(0xe18e56, 2.2); rim.position.set(7, 4, -7); scene.add(rim);
const rear = new THREE.DirectionalLight(0x90a9bf, 2.0); rear.position.set(-6, 5, -10); scene.add(rear);

const model = new THREE.Group();
model.position.set(0.55, 0.32, 0);
model.rotation.set(0, 0, 0);
scene.add(model);
const finish = (color, metalness = 0.7, roughness = 0.36) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
const graphite = finish(0x202d3a, 0.72, 0.49);
const brushed = finish(0x60768c, 0.82, 0.30);
const edge = finish(0x34485a, 0.76, 0.35);
const dark = finish(0x0a121e, 0.35, 0.64);
const rubber = finish(0x0b111a, 0.0, 0.87);
const silver = finish(0xc3d2df, 0.92, 0.24);
const vents = finish(0x080f18, 0.15, 0.68);
const led = new THREE.MeshStandardMaterial({ color: 0xff9b59, emissive: 0xff6b30, emissiveIntensity: 1.8 });
const activeMaterial = finish(0x6a8b70, 0.45, 0.42);

function roundedGeometry(w, h, d, r) {
  const s = new THREE.Shape(), a = w/2, b = h/2, k = Math.min(r, d/4);
  s.moveTo(-a+r,-b); s.lineTo(a-r,-b); s.quadraticCurveTo(a,-b,a,-b+r);
  s.lineTo(a,b-r); s.quadraticCurveTo(a,b,a-r,b);
  s.lineTo(-a+r,b); s.quadraticCurveTo(-a,b,-a,b-r);
  s.lineTo(-a,-b+r); s.quadraticCurveTo(-a,-b,-a+r,-b);
  const g = new THREE.ExtrudeGeometry(s,{ depth:d-2*k, bevelEnabled:true, bevelThickness:k, bevelSize:k*0.38, bevelSegments:2, steps:1, curveSegments:4 });
  g.translate(0,0,-(d-2*k)/2);
  return g;
}
function box(w, h, d, x, y, z, material, rounded = 0) {
  const geometry = rounded ? roundedGeometry(w, h, d, rounded) : new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geometry, material);
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

function ring(radius, tube, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 48), material);
  mesh.position.set(x, y, z);
  model.add(mesh);
  return mesh;
}

function label(text, x, y, width, color = "#c6d4e3", font = 34) {
  const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 128;
  const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, 1024, 128);
  ctx.fillStyle = color; ctx.font = `600 ${font}px Arial`; ctx.fillText(text, 12, 83);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.24), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
  mesh.position.set(x, y, 1.285); model.add(mesh);
}

/* =========================================
   FULL 3D CHASSIS, SIDES AND REAR
   ========================================= */

box(10.85, 6.15, 3.55, 0, 0, -0.75, graphite, 0.22);
box(10.9, 6.18, 0.18, 0, 0, 0.96, brushed, 0.18);
box(10.66, 5.94, 0.16, 0, 0, 1.08, edge, 0.14);
box(10.35, 5.64, 0.09, 0, 0, 1.175, graphite, 0.12);
box(10.8, 0.12, 3.52, 0, 3.02, -0.75, brushed);
box(10.8, 0.12, 3.52, 0, -3.02, -0.75, edge);
box(10.65, 5.98, 0.12, 0, 0, -2.54, edge, 0.12);

for (const side of [-1, 1]) {
  box(0.06, 5.65, 2.96, side * 5.44, 0, -0.80, brushed);
  for (let i = 0; i < 11; i++) box(0.07, 0.075, 1.40, side * 5.485, -1.90 + i * 0.37, -0.98, vents);
  for (const z of [-1.96, 0.55]) box(0.16, 5.96, 0.09, side * 5.46, 0, z, edge);
}

for (let row = 0; row < 3; row++) for (let col = 0; col < 12; col++) box(0.23, 0.018, 0.085, -4.4 + col * 0.80, 3.095, -1.95 + row * 0.58, vents);
for (const x of [-4.25, 4.25]) for (const z of [-1.92, 0.37]) box(0.72, 0.25, 0.88, x, -3.17, z, rubber, 0.08);

for (const x of [-2.8, 1.5]) {
  ring(0.77, 0.065, x, 0.68, -2.64, dark);
  ring(0.59, 0.04, x, 0.68, -2.66, brushed);
  for (let i = 0; i < 9; i++) {
    const a = i * Math.PI / 9;
    const blade = box(1.20, 0.06, 0.05, x, 0.68, -2.66, vents);
    blade.rotation.z = a;
  }
}
box(1.23, 0.67, 0.08, 3.65, -1.73, -2.64, dark, 0.05);
for (let i = 0; i < 3; i++) box(0.13, 0.32, 0.03, 3.29 + i * 0.34, -1.73, -2.69, brushed);
for (const x of [-5.0, 5.0]) for (const y of [-2.70, 2.70]) cylinder(0.072, 0.06, x, y, 1.26, silver, 12);

/* =========================================
   PHYSICAL DISPLAY AND CONTROLS
   ========================================= */

box(7.78, 4.78, 0.18, -1.23, 0.03, 1.25, dark, 0.095);
box(7.43, 4.49, 0.045, -1.23, 0.03, 1.365, finish(0x152738, 0.30, 0.24), 0.03);
box(2.52, 4.79, 0.12, 3.86, 0.03, 1.235, graphite, 0.07);
box(10.16, 0.74, 0.10, 0, -2.47, 1.25, edge);

label("LS / SIGNAL ANALYSIS", -3.52, 2.67, 2.65, "#e2eaf2", 39);
label("4004 SERIES  |  RESEARCH WORKBENCH", 2.94, 2.67, 3.02, "#bdc9d6", 27);
label("AMPLITUDE", 3.72, 1.92, 1.31, "#c1d1df", 36);
label("FREQUENCY", 3.72, 0.63, 1.31, "#c1d1df", 36);

for (const [x,y,r] of [[3.84,1.24,0.36],[3.84,-0.04,0.29]]) {
  cylinder(r + 0.10, 0.09, x, y, 1.39, dark);
  cylinder(r, 0.19, x, y, 1.49, silver);
  cylinder(r * 0.80, 0.22, x, y, 1.57, brushed);
  const mark = box(0.035, r * 0.56, 0.025, x, y + r * 0.44, 1.71, silver);
}

for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
  box(0.52, 0.38, 0.19, 2.96 + col * 0.84, -0.82 - row * 0.49, 1.43, row === 2 && col === 2 ? activeMaterial : brushed, 0.035);
}

const inputJack = cylinder(0.28, 0.18, -4.86, -2.49, 1.43, silver);
cylinder(0.18, 0.22, -4.86, -2.49, 1.56, dark);
cylinder(0.055, 0.24, -4.86, -2.49, 1.69, led);
for (const x of [-3.72, -2.61, -1.50, -0.39]) {
  cylinder(0.22, 0.16, x, -2.49, 1.36, silver);
  cylinder(0.135, 0.20, x, -2.49, 1.48, dark);
  ring(0.15, 0.024, x, -2.49, 1.59, brushed);
}
cylinder(0.07, 0.10, 4.78, 2.65, 1.32, led);

/* =========================================
   INTERNAL INTERACTIVE DISPLAY
   ========================================= */

const displayCanvas = document.createElement("canvas");
displayCanvas.width = 1440; displayCanvas.height = 840;
const ctx = displayCanvas.getContext("2d");
const displayTexture = new THREE.CanvasTexture(displayCanvas);
displayTexture.colorSpace = THREE.SRGBColorSpace;
displayTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
const screen = new THREE.Mesh(new THREE.PlaneGeometry(7.31, 4.40), new THREE.MeshBasicMaterial({ map: displayTexture, toneMapped: false }));
screen.position.set(-1.23, 0.03, 1.412);
model.add(screen);

let selected = null;
const orange = "#eaa16e", white = "#e2eaf3", muted = "#92aabd", green = "#a6cfbd";

function text(value, x, y, font = "26px monospace", color = white) { ctx.fillStyle = color; ctx.font = font; ctx.fillText(value, x, y); }
function line(x1, y1, x2, y2, color = "#344b60", width = 2) { ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function grid(x, y, w, h) {
  ctx.fillStyle = "#061320"; ctx.fillRect(x, y, w, h);
  for (let px = x; px <= x+w; px += 50) line(px, y, px, y+h, "#102c3e", 1);
  for (let py = y; py <= y+h; py += 50) line(x, py, x+w, py, "#102c3e", 1);
}
function waveform(x, y, w, h, index) {
  ctx.strokeStyle = index === 1 ? "#85b8cf" : orange; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i <= w; i += 3) {
    const amplitude = index === 0 ? Math.abs(Math.sin(i * 0.022)) * 0.35 + 0.13 : 0.3;
    const v = index === 0 ? Math.sin(i * 0.13) * amplitude : Math.sin(i * 0.025) * amplitude;
    const py = y + h * (0.50 + v);
    if (i === 0) ctx.moveTo(x+i,py); else ctx.lineTo(x+i,py);
  }
  ctx.stroke();
}
function network(x, y, w, h) {
  const coords = [[0.06,0.52],[0.28,0.18],[0.43,0.73],[0.63,0.24],[0.82,0.57],[0.95,0.35]];
  ctx.strokeStyle = "#89b9d4"; ctx.lineWidth = 4; ctx.beginPath();
  coords.forEach(([a,b],i) => i ? ctx.lineTo(x+a*w,y+b*h) : ctx.moveTo(x+a*w,y+b*h)); ctx.stroke();
  coords.forEach(([a,b]) => { ctx.fillStyle = orange; ctx.beginPath(); ctx.arc(x+a*w,y+b*h,6,0,Math.PI*2); ctx.fill(); });
}
function drawDisplay() {
  const W = displayCanvas.width, H = displayCanvas.height;
  ctx.fillStyle = "#040d17"; ctx.fillRect(0, 0, W, H);
  if (selected === null) {
    text("MULTI-CHANNEL PROJECT MONITOR", 32, 45, "25px monospace", muted);
    text("SIMULATED / DEMO", 1110, 45, "24px monospace", orange);
    projects.forEach((p, i) => {
      const x = 20 + (i % 2) * 705, y = 73 + Math.floor(i/2) * 373, w = 694, h = 355;
      grid(x, y, w, h); ctx.strokeStyle = "#3e627c"; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
      text(p.channel, x+24, y+38, "21px monospace", muted);
      text(i < 2 ? "PUBLIC" : "STANDBY", x+w-139, y+38, "20px monospace", i < 2 ? green : muted);
      if (i === 0) waveform(x+30,y+76,w-60,132,0);
      else if (i === 1) network(x+30,y+76,w-60,132);
      else text(i === 2 ? "RESEARCH IN PROGRESS" : "AWAITING NEW EXPERIMENT", x+95, y+166, "24px monospace", "#66839a");
      text(p.name, x+24, y+272, "bold 30px Arial", white);
      text("SELECT TO EXPLORE  >", x+24, y+316, "21px monospace", orange);
    });
  } else {
    const p = projects[selected]; grid(0,0,W,H);
    ctx.fillStyle = "#0e2637"; ctx.fillRect(22,22,300,71); ctx.strokeStyle = "#49677e"; ctx.strokeRect(22,22,300,71);
    text("<  ALL CHANNELS", 45, 68, "27px monospace", orange);
    text(p.channel, 1090, 65, "28px monospace", muted);
    line(44,120,1396,120);
    text(p.name, 65, 201, "bold 54px Arial", white);
    text(p.status, 69, 260, "27px monospace", p.url ? green : muted);
    if (selected < 2) { waveform(70,310,1240,255,selected); if (selected === 1) network(70,340,1240,200); }
    else text("NO PUBLIC MEASUREMENTS AVAILABLE", 110, 455, "32px monospace", muted);
    line(60,600,1380,600);
    p.description.forEach((s,i) => text(s, 76, 661+i*42, "32px Arial", white));
    if (p.url) {
      ctx.fillStyle = "#334d61"; ctx.fillRect(902,715,460,85);
      ctx.strokeStyle = "#b77d55"; ctx.strokeRect(902,715,460,85);
      text("OPEN REPOSITORY  >", 937,768,"30px monospace", "#ffd1ab");
    }
  }
  displayTexture.needsUpdate = true;
}
drawDisplay();

/* =========================================
   POINTER AND KEYBOARD INTERACTION
   ========================================= */

const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let dragging = false, moved = false, lastX = 0, lastY = 0, startX = 0, startY = 0;
let targetY = 0, targetX = 0, visible = true, needsRender = true;

function hitScreen(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set(2*(event.clientX-rect.left)/rect.width-1, 1-2*(event.clientY-rect.top)/rect.height);
  raycaster.setFromCamera(pointer,camera);
  const hits = raycaster.intersectObject(screen);
  if (!hits.length || !hits[0].uv) return null;
  const uv = hits[0].uv;
  return { x: uv.x, y: 1-uv.y };
}
function activateScreen(position) {
  if (!position) return;
  if (selected === null) {
    const col = position.x < 0.5 ? 0 : 1, row = position.y < 0.52 ? 0 : 1;
    selected = row*2+col;
  } else if (position.x < 0.25 && position.y < 0.15) selected = null;
  else if (projects[selected].url && position.x > 0.62 && position.y > 0.83) window.open(projects[selected].url, "_blank", "noopener,noreferrer");
  drawDisplay(); needsRender = true;
}
renderer.domElement.addEventListener("pointerdown", event => {
  if (event.button !== 0) return;
  dragging = true; moved = false;
  startX = lastX = event.clientX; startY = lastY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});
renderer.domElement.addEventListener("pointermove", event => {
  if (!dragging) return;
  const dx = event.clientX-lastX, dy = event.clientY-lastY;
  if (Math.hypot(event.clientX-startX,event.clientY-startY)>5) moved = true;
  if (moved) { targetY += dx*0.006; targetX = THREE.MathUtils.clamp(targetX+dy*0.004,-0.55,0.55); needsRender = true; }
  lastX = event.clientX; lastY = event.clientY;
});
renderer.domElement.addEventListener("pointerup", event => {
  if (!dragging) return;
  dragging = false;
  if (!moved) activateScreen(hitScreen(event));
});
renderer.domElement.addEventListener("pointercancel", () => dragging = false);
renderer.domElement.addEventListener("lostpointercapture", () => dragging = false);
window.addEventListener("keydown", event => {
  if (!visible) return;
  if (event.key === "Escape") { selected = null; drawDisplay(); needsRender = true; }
  const i = Number(event.key);
  if (i >= 1 && i <= 4) { selected = i-1; drawDisplay(); needsRender = true; }
});

/* =========================================
   RESPONSIVE CAMERA AND CABLE ANCHOR
   ========================================= */


/* BNC RF bulkhead coupler and flexible transmission cable */

const cableJacketMaterial = new THREE.MeshBasicMaterial({ color: 0x82a9cc, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false });
const cableGlassMaterial = new THREE.MeshBasicMaterial({ color: 0xd2eaff, transparent: true, opacity: 0.07, depthWrite: false, toneMapped: false });
const cableLightMaterial = new THREE.MeshBasicMaterial({ color: 0xf18b49, transparent: true, opacity: 0.42, depthWrite: false, toneMapped: false });

const cableJacketMesh = new THREE.Mesh(new THREE.BufferGeometry(), cableJacketMaterial);
const cableGlassMesh = new THREE.Mesh(new THREE.BufferGeometry(), cableGlassMaterial);
const cableLightMesh = new THREE.Mesh(new THREE.BufferGeometry(), cableLightMaterial);
scene.add(cableJacketMesh, cableGlassMesh, cableLightMesh);

/* Stationary BNC coupling assembly */

const bncGroup = new THREE.Group();
scene.add(bncGroup);

const bncSteel = finish(0x71879a, 0.88, 0.27);
const bncBright = finish(0xc4d2dc, 0.90, 0.22);
const bncDark = finish(0x263545, 0.65, 0.44);
const bncRubber = finish(0x172432, 0.12, 0.84);

function bncCylinder(radius, height, y, material, sides = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, sides), material);
  mesh.position.y = y;
  bncGroup.add(mesh);
  return mesh;
}

function bncRing(radius, thickness, y, material) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 8, 32), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  bncGroup.add(mesh);
  return mesh;
}

/* Bulkhead body, hexagonal nut and locking sleeve */

bncCylinder(0.29, 0.40, 0.12, bncSteel);
bncCylinder(0.39, 0.17, 0.22, bncBright, 6);
bncCylinder(0.32, 0.13, 0.02, bncDark);
bncCylinder(0.31, 0.21, -0.16, bncSteel);
bncRing(0.32, 0.035, -0.22, bncBright);
bncRing(0.30, 0.025, -0.29, bncDark);

/* Bayonet locking pins */

for (const side of [-1, 1]) {
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), bncBright);
  pin.position.set(side * 0.31, -0.15, 0);
  bncGroup.add(pin);
}

/* Flexible cable strain relief */

bncCylinder(0.25, 0.17, -0.37, bncRubber);
for (const y of [-0.34, -0.39, -0.44]) bncRing(0.247, 0.014, y, bncSteel);

/* Screen-to-world alignment */

function screenToWorld(fx, fy, z) {
  const point = new THREE.Vector3(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(camera);
  const direction = point.sub(camera.position).normalize();
  return camera.position.clone().addScaledVector(direction, (z - camera.position.z) / direction.z);
}

/* Scroll-controlled signal */

let cableSignalProgress = window.handsOnCableSignalProgress || 0;

window.addEventListener("hands-on-cable-progress", () => {
  cableSignalProgress = window.handsOnCableSignalProgress || 0;
  needsRender = true;
});


/* Adaptive flexible cable: compact at rest, responsive to instrument rotation */


/* Adaptive cable routed outside the analyzer chassis */

function updateFlexibleCable() {
  const rect = viewport.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  model.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);

  const corners = fitCorners.map(point => point.clone().applyMatrix4(model.matrixWorld));
  const rearZ = Math.min(...corners.map(point => point.z)) - 0.9;
  const fx = (anchorRect.left + anchorRect.width / 2 - rect.left) / rect.width;
  const fy = (anchorRect.top + anchorRect.height / 2 - rect.top) / rect.height;
  const inlet = screenToWorld(fx, fy, rearZ);

  const pixelScale = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - inlet.z) / rect.height;
  const cableRadius = THREE.MathUtils.clamp(21 * pixelScale, 0.20, 0.38);
  const couplerScale = cableRadius / 0.28;

  bncGroup.position.copy(inlet);
  bncGroup.scale.setScalar(couplerScale);

  const local = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(model.matrixWorld);
  const outlet = inlet.clone().add(new THREE.Vector3(0, -0.52 * couplerScale, 0));
  const lead = outlet.clone().add(new THREE.Vector3(0, -0.30 * couplerScale, 0));
  const start = model.worldToLocal(lead.clone());

  /* Clearance coordinates measured against the actual chassis */
  const leftX = -5.95;
  const bottomY = -3.62;
  const frontZ = 2.36;
  const via = [];

  /* Choose an external route based on the fixed cable's position */
  if (start.z < -2.90) {
    via.push([leftX, start.y, start.z], [leftX, bottomY, start.z]);
  } else if (start.x < -5.70) {
    via.push([start.x, bottomY, start.z], [leftX, bottomY, start.z]);
  } else if (start.y < -3.42) {
    via.push([leftX, start.y, start.z], [leftX, bottomY, start.z]);
  } else if (start.x > 5.70) {
    via.push([start.x, bottomY, start.z], [leftX, bottomY, start.z]);
  } else if (start.z > 2.05) {
    via.push([start.x, bottomY, start.z], [leftX, bottomY, start.z]);
  } else if (start.y > 3.42) {
    via.push([leftX, start.y, start.z], [leftX, bottomY, start.z]);
  } else {
    via.push([leftX, start.y, Math.min(start.z, -3.12)], [leftX, bottomY, -3.12]);
  }

  /* Travel outside the left and lower chassis edges */
  const points = [
    outlet,
    lead,
    ...via.map(([x, y, z]) => local(x, y, z)),
    local(leftX, bottomY, frontZ),
    local(-5.65, -3.40, frontZ),
    local(-5.12, -2.82, frontZ),
    local(-4.86, -2.49, 1.84)
  ];

  const cleanPoints = points.filter((point, i) => i === 0 || point.distanceTo(points[i - 1]) > 0.03);
  const curve = new THREE.CatmullRomCurve3(cleanPoints, false, "centripetal");

  cableJacketMesh.geometry.dispose();
  cableGlassMesh.geometry.dispose();
  cableLightMesh.geometry.dispose();

  cableJacketMesh.geometry = new THREE.TubeGeometry(curve, 64, cableRadius, 12, false);
  cableGlassMesh.geometry = new THREE.TubeGeometry(curve, 64, cableRadius * 0.86, 12, false);
  cableLightMesh.geometry = new THREE.TubeGeometry(curve, 64, cableRadius * 0.43, 8, false);

  const visibleSegments = Math.floor(64 * THREE.MathUtils.clamp(cableSignalProgress, 0, 1));
  cableLightMesh.geometry.setDrawRange(0, visibleSegments * 8 * 6);
}

const fitCorners = [];
for (const x of [-5.85, 5.85]) {
  for (const y of [-3.95, 3.65]) {
    for (const z of [-2.85, 2.65]) fitCorners.push(new THREE.Vector3(x, y, z));
  }
}

function fitCamera(immediate = false) {
  model.updateMatrixWorld(true);

  const halfV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const halfH = halfV * camera.aspect;
  let requiredDistance = 0;

  for (const corner of fitCorners) {
    const point = corner.clone().applyMatrix4(model.matrixWorld);
    const distance = point.z + Math.max(Math.abs(point.x) / (halfH * 0.90), Math.abs(point.y) / (halfV * 0.81));
    requiredDistance = Math.max(requiredDistance, distance);
  }

  const targetDistance = Math.max(12.8, requiredDistance + 0.45);
  const previousDistance = camera.position.z;
  const distance = immediate || targetDistance > previousDistance ? targetDistance : THREE.MathUtils.lerp(previousDistance, targetDistance, 0.15);

  camera.position.set(0, 0.22, distance);
  camera.lookAt(0.20, 0.18, -0.55);
  camera.updateMatrixWorld(true);

  return Math.abs(previousDistance - distance) > 0.005;
}

function resize() {
  const rect = viewport.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  fitCamera(true);
  renderer.setSize(rect.width, rect.height, false);
  updateCableAnchor();
  needsRender = true;
}


const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(viewport);
if ("IntersectionObserver" in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; needsRender = true; }, { threshold: 0.01 }).observe(viewport);

function updateCableAnchor() {
  const stage = viewport.closest(".instrument-stage");
  const stageRect = stage.getBoundingClientRect();
  const headingRect = document.querySelector(".hands-on-heading")?.getBoundingClientRect();

  if (!stageRect.width || !stageRect.height) return;

  const x = headingRect && window.innerWidth > 900 ? headingRect.left + 28 - stageRect.left : stageRect.width * 0.115;
  const y = stageRect.height * 0.71;

  anchor.style.left = `${x}px`;
  anchor.style.top = `${y}px`;
}

function animate() {
  requestAnimationFrame(animate);
  if (!visible) return;
  const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0.14;
  if (Math.abs(model.rotation.y-targetY)+Math.abs(model.rotation.x-targetX)>0.0004) {
    model.rotation.y = THREE.MathUtils.lerp(model.rotation.y,targetY,speed);
    model.rotation.x = THREE.MathUtils.lerp(model.rotation.x,targetX,speed);
    needsRender = true;
  }

  if (fitCamera(false)) needsRender = true;

  if (!needsRender) return;
  model.updateMatrixWorld(true);
  updateCableAnchor();
  updateFlexibleCable();
  renderer.render(scene,camera);
  needsRender = false;
}
resize();
shell.classList.add("instrument-ready");
animate();