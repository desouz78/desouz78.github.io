
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const container = document.getElementById("antenna-scene");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

camera.position.set(6, 3.5, 8.5);
camera.lookAt(0, -0.15, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xb7c8df, 1.5));

const keyLight = new THREE.DirectionalLight(0xeaf3ff, 3);
keyLight.position.set(4, 7, 6);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xff884a, 2);
rimLight.position.set(-5, 2, -4);
scene.add(rimLight);

// Materials
const metal = new THREE.MeshStandardMaterial({
  color: 0xb7c8d9,
  metalness: 0.85,
  roughness: 0.24
});

const darkMetal = new THREE.MeshStandardMaterial({
  color: 0x354457,
  metalness: 0.8,
  roughness: 0.35
});

const orange = new THREE.MeshStandardMaterial({
  color: 0xff803e,
  emissive: 0xff6225,
  emissiveIntensity: 1.6
});

const antenna = new THREE.Group();
scene.add(antenna);

// Metallic rods between two points
function rod(start, end, radius, material) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);

  const direction = new THREE.Vector3().subVectors(b, a);

  const geometry = new THREE.CylinderGeometry(
    radius, radius, direction.length(), 12
  );

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(a).add(b).multiplyScalar(0.5);

  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize()
  );

  antenna.add(mesh);
  return mesh;
}

// Longitudinal boom
rod([0, 0, -2.5], [0, 0, 2.0], 0.065, darkMetal);

// Cross-polarized Yagi elements
function addElements(z, length, driven = false) {
  const half = length / 2;

  if (driven) {
    const gap = 0.055;

    for (const sign of [-1, 1]) {
      rod([sign * gap, 0, z], [sign * half, 0, z], 0.025, metal);
      rod([0, sign * gap, z], [0, sign * half, z], 0.025, metal);
    }
  } else {
    rod([-half, 0, z], [half, 0, z], 0.022, metal);
    rod([0, -half, z], [0, half, z], 0.022, metal);
  }
}

// Reflector, driven elements and directors
addElements(1.75, 2.65);
addElements(1.25, 2.48, true);

for (let i = 0; i < 11; i++) {
  const z = 0.85 - i * 0.31;
  const length = 2.30 - i * 0.025;

  addElements(z, length);
}

// Support mast
rod([0, -2.25, 0.4], [0, -0.15, 0.4], 0.085, darkMetal);

// Feed-point highlight
const feed = new THREE.Mesh(
  new THREE.SphereGeometry(0.08, 16, 16),
  orange
);

feed.position.set(0, 0, 1.25);
antenna.add(feed);

// Mouse interaction
let pointerX = 0;
let pointerY = 0;

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX / window.innerWidth - 0.5;
  pointerY = event.clientY / window.innerHeight - 0.5;
});

// Responsive canvas
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();

// Animation
const clock = new THREE.Clock();
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function animate() {
  requestAnimationFrame(animate);

  if (!reduceMotion) {
    const time = clock.getElapsedTime();

    antenna.rotation.y += (
      -0.25 + pointerX * 0.45 +
      Math.sin(time * 0.35) * 0.08 -
      antenna.rotation.y
    ) * 0.035;

    antenna.rotation.x += (
      -0.12 + pointerY * 0.18 -
      antenna.rotation.x
    ) * 0.035;
  }

  renderer.render(scene, camera);
}

animate();
