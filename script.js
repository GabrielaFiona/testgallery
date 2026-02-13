// 3D Gallery Walkthrough (Three.js + Pointer Lock)
// Click canvas to enter. WASD + mouse look. Shift sprint.

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

const canvas = document.querySelector("#c");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x070812, 8, 60);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Camera + Controls
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 1.65, 8);

const controls = new PointerLockControls(camera, document.body);

// Click to lock
canvas.addEventListener("click", () => controls.lock());
controls.addEventListener("lock", () => {
  document.querySelector(".hint").textContent = "WASD move • Mouse look • Shift sprint • Esc exit";
});
controls.addEventListener("unlock", () => {
  document.querySelector(".hint").textContent = "Click to enter • WASD move • Mouse look • Shift sprint • Esc exit";
});

// ---------- Materials (colorful vibe)
const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f1028, roughness: 0.9, metalness: 0.0 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0x1b1f3a, roughness: 0.7, metalness: 0.15 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b0c18, roughness: 0.95, metalness: 0.0 });
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x0a0b14, roughness: 1.0, metalness: 0.0 });

// Floor
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Ceiling
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), ceilingMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 6;
scene.add(ceiling);

// Simple gallery walls (a long hallway + side rooms feel)
function addWall(w, h, x, y, z, ry=0) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5), wallMat);
  wall.position.set(x, y, z);
  wall.rotation.y = ry;
  scene.add(wall);

  // trim
  const trim = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.55), trimMat);
  trim.position.set(x, 0.06, z);
  trim.rotation.y = ry;
  scene.add(trim);

  return wall;
}

// Main corridor walls
addWall(60, 6, 0, 3, -10, 0);
addWall(60, 6, 0, 3,  10, 0);
addWall(0.5, 6, -30, 3, 0, 0);
addWall(0.5, 6,  30, 3, 0, 0);

// Create “openings” vibes with short segments
addWall(10, 6, -15, 3, 0, 0);
addWall(10, 6,  15, 3, 0, 0);

// ---------- Colorful lights
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const key = new THREE.PointLight(0x2bbcff, 1.1, 50);
key.position.set(-10, 4.2, 2);
scene.add(key);

const pink = new THREE.PointLight(0xff2bd6, 1.2, 55);
pink.position.set(12, 4.0, -4);
scene.add(pink);

const gold = new THREE.PointLight(0xfeda2c, 0.8, 45);
gold.position.set(0, 4.5, 0);
scene.add(gold);

// Neon “portal” glow at far end
const portal = new THREE.PointLight(0x7c3aed, 1.6, 60);
portal.position.set(0, 2.5, -24);
scene.add(portal);

// ---------- Particles for fun atmosphere
const particleCount = 900;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  pPos[i*3+0] = (Math.random()-0.5) * 55;
  pPos[i*3+1] = Math.random() * 5.5 + 0.2;
  pPos[i*3+2] = (Math.random()-0.5) * 55;
}
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ size: 0.035, color: 0xffffff, transparent: true, opacity: 0.45 });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// ---------- Paintings
// Replace URLs with yours. If you leave as null, it uses colorful placeholder "paint" materials.
const PAINTINGS = [
  // { url: "https://your-image-url.com/painting1.jpg", title: "Ocean Dream" },
  // { url: "https://your-image-url.com/painting2.jpg", title: "Neon Bloom" },
  { url: null, title: "Painting 01" },
  { url: null, title: "Painting 02" },
  { url: null, title: "Painting 03" },
  { url: null, title: "Painting 04" },
  { url: null, title: "Painting 05" },
  { url: null, title: "Painting 06" }
];

const loader = new THREE.TextureLoader();
function makePaintingMaterial(url, fallbackColor) {
  if (!url) {
    return new THREE.MeshStandardMaterial({
      color: fallbackColor,
      roughness: 0.65,
      metalness: 0.15,
      emissive: fallbackColor,
      emissiveIntensity: 0.15
    });
  }
  const tex = loader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, metalness: 0.05 });
}

function addPainting({ url }, x, y, z, ry, w=3.2, h=2.1, glowColor=0x2bbcff) {
  // frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.25, h + 0.25, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x0d0d14, roughness: 0.4, metalness: 0.35 })
  );
  frame.position.set(x, y, z);
  frame.rotation.y = ry;
  scene.add(frame);

  // canvas
  const paint = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    makePaintingMaterial(url, glowColor)
  );
  paint.position.set(x, y, z + Math.cos(ry) * 0.08);
  paint.rotation.y = ry;
  scene.add(paint);

  // tiny spotlight above each painting
  const spot = new THREE.SpotLight(glowColor, 0.7, 12, Math.PI/6, 0.4, 1.2);
  spot.position.set(x + Math.sin(ry) * 1.0, y + 1.8, z + Math.cos(ry) * 1.0);
  spot.target.position.set(x, y, z);
  scene.add(spot);
  scene.add(spot.target);

  // invisible trigger area for “inspect” feel later if you want
  return paint;
}

// Place paintings along walls
const colors = [0x2bbcff, 0xff2bd6, 0xfeda2c, 0x25b230, 0x7c3aed, 0xff7a18];
let idx = 0;

for (let i = 0; i < PAINTINGS.length; i++) {
  const side = i % 2 === 0 ? -1 : 1;
  const z = 12 - i * 6;
  const x = side * 12.5;
  const ry = side === -1 ? Math.PI/2 : -Math.PI/2;
  addPainting(PAINTINGS[i], x, 2.3, z, ry, 3.35, 2.2, colors[idx++ % colors.length]);
}

// ---------- Movement (WASD + sprint)
const keys = { w:false, a:false, s:false, d:false, shift:false };
addEventListener("keydown", (e) => {
  if (e.code === "KeyW") keys.w = true;
  if (e.code === "KeyA") keys.a = true;
  if (e.code === "KeyS") keys.s = true;
  if (e.code === "KeyD") keys.d = true;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") keys.shift = true;
});
addEventListener("keyup", (e) => {
  if (e.code === "KeyW") keys.w = false;
  if (e.code === "KeyA") keys.a = false;
  if (e.code === "KeyS") keys.s = false;
  if (e.code === "KeyD") keys.d = false;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") keys.shift = false;
});

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

function clampToGallery(pos){
  // simple bounds so you don’t walk outside the “map”
  pos.x = THREE.MathUtils.clamp(pos.x, -26, 26);
  pos.z = THREE.MathUtils.clamp(pos.z, -28, 20);
  pos.y = 1.65; // keep camera height stable
}

let last = performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  // float particles subtly
  particles.rotation.y += dt * 0.06;

  if (controls.isLocked) {
    const speed = keys.shift ? 7.0 : 4.2;

    direction.set(0,0,0);
    if (keys.w) direction.z -= 1;
    if (keys.s) direction.z += 1;
    if (keys.a) direction.x -= 1;
    if (keys.d) direction.x += 1;
    direction.normalize();

    // PointerLockControls move methods
    if (direction.z !== 0) controls.moveForward(direction.z * speed * dt);
    if (direction.x !== 0) controls.moveRight(direction.x * speed * dt);

    clampToGallery(camera.position);
  }

  renderer.render(scene, camera);
}
animate(performance.now());

// Resize
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
