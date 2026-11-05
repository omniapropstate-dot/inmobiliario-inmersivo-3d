import * as THREE from 'three';
import { BUILDING } from './data.js';

const FLOOR_HEIGHT = 1;
const FLOOR_WIDTH = 4;
const FLOOR_DEPTH = 3;
const GAP = 0.08;
const STEP = FLOOR_HEIGHT + GAP;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function createBuildingScene(canvas, { onFloorClick, onFloorHover }) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x15120f, 0.05);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const idleTarget = new THREE.Vector3(0, 0.4, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(new THREE.AmbientLight(0x8c8273, 2.2));
  const sun = new THREE.DirectionalLight(0xffd9a0, 2.2);
  sun.position.set(6, 10, 4);
  scene.add(sun);
  const rim = new THREE.PointLight(0xd6a756, 1.6, 30);
  rim.position.set(-6, 4, -6);
  scene.add(rim);

  const building = new THREE.Group();
  const totalH = BUILDING.pisosTotales * STEP;
  building.position.y = -totalH / 2 + FLOOR_HEIGHT / 2;
  scene.add(building);

  const pickable = [];
  for (let i = 0; i < BUILDING.pisosTotales; i++) {
    const geo = new THREE.BoxGeometry(FLOOR_WIDTH, FLOOR_HEIGHT, FLOOR_DEPTH);
    const mat = new THREE.MeshPhysicalMaterial({
      color: i === 0 ? 0x453a2c : 0x3c3327,
      roughness: 0.35,
      metalness: 0.1,
      transmission: 0.06,
      thickness: 0.4,
      clearcoat: 0.3,
      emissive: 0x000000,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = i * STEP;
    mesh.userData.piso = i + 1;
    building.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x5a5247, transparent: true, opacity: 0.55 })
    );
    edges.position.copy(mesh.position);
    building.add(edges);

    if (i > 0) pickable.push(mesh); // piso 1 = lobby, no es clickeable
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;

  function setPointerFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickable);
    return hits.length ? hits[0].object : null;
  }

  canvas.addEventListener('pointermove', (e) => {
    if (flight.active) return;
    setPointerFromEvent(e);
    const hit = pick();
    if (hit !== hovered) {
      if (hovered) hovered.material.emissive.setHex(0x000000);
      hovered = hit;
      if (hovered) hovered.material.emissive.setHex(0x4a3418);
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
      onFloorHover(hovered ? hovered.userData.piso : null);
    }
  });

  canvas.addEventListener('pointerleave', () => {
    if (hovered) hovered.material.emissive.setHex(0x000000);
    hovered = null;
    onFloorHover(null);
  });

  canvas.addEventListener('click', (e) => {
    if (flight.active) return;
    setPointerFromEvent(e);
    const hit = pick();
    if (hit) onFloorClick(hit.userData.piso);
  });

  let autoRotate = true;
  let rafId = null;
  const idleRadius = 13;
  const flight = { active: false, start: 0, duration: 1100, from: new THREE.Vector3(), to: new THREE.Vector3(), resolve: null };

  function animate() {
    rafId = requestAnimationFrame(animate);

    if (flight.active) {
      const t = Math.min((performance.now() - flight.start) / flight.duration, 1);
      const e = easeInOut(t);
      camera.position.lerpVectors(flight.from, flight.to, e);
      camera.lookAt(flight.lookAt);
      if (t >= 1) {
        flight.active = false;
        flight.resolve?.();
      }
    } else if (autoRotate) {
      const t = Date.now() * 0.00009;
      camera.position.set(Math.sin(t) * idleRadius, 6, Math.cos(t) * idleRadius);
      camera.lookAt(idleTarget);
    }

    renderer.render(scene, camera);
  }
  animate();

  function flyToFloor(piso) {
    autoRotate = false;
    const i = piso - 1;
    const worldY = building.position.y + i * STEP;
    const to = new THREE.Vector3(5.2, worldY + 1.4, 6.4);
    const lookAt = new THREE.Vector3(0, worldY, 0);

    if (reduceMotion) {
      camera.position.copy(to);
      camera.lookAt(lookAt);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      flight.from = camera.position.clone();
      flight.to = to;
      flight.lookAt = lookAt;
      flight.start = performance.now();
      flight.active = true;
      flight.resolve = resolve;
    });
  }

  function resetView() {
    autoRotate = true;
    if (rafId === null) animate();
  }

  function pause() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return { flyToFloor, resetView, pause };
}
