// Rider profile: a little 3D Saurabh you can spin and poke.
// Built from simple shapes so it stays light and loads offline from the site itself.
import * as THREE from "./vendor/three.module.min.js";

const C = {
  skin: 0xc8977a, hair: 0x1c1917, beardDark: 0x2a2624, jacket: 0xe0662c, jacketDeep: 0xc4521f,
  pants: 0x24272a, boots: 0x3d2b21, strap: 0x151617, wood: 0xc98a4b, woodDark: 0x5a3a22, cup: 0xf4efe6, sleeve: 0x8b5a3c,
};

function mat(color, rough = 0.75, metal = 0, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
}

function camoTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#f1f2f0"; g.fillRect(0, 0, 256, 256);
  const blob = (x, y, r, col) => {
    g.fillStyle = col; g.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.5) { const rr = r * (0.65 + Math.random() * 0.6); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill();
  };
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 26; i++) blob(rnd() * 256, rnd() * 256, 10 + rnd() * 18, i % 2 ? "#8d9497" : "#2a2f31");
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function saltPepperTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#2b2725"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, grey = Math.random() < 0.35;
    g.strokeStyle = grey ? `rgba(205,205,200,${0.5 + Math.random() * 0.4})` : `rgba(10,8,8,${0.5})`;
    g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 3, y + 4 + Math.random() * 4); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function mountRider(container, onPick) {
  const W = () => container.clientWidth, H = () => container.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = "none";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.1, 50);
  camera.position.set(0, 1.45, 5.5);
  camera.lookAt(0, 1.18, 0);

  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x9c8a72, 1.25));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(2.5, 5, 4); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -2; sun.shadow.camera.right = 2; sun.shadow.camera.top = 3; sun.shadow.camera.bottom = -1;
  sun.shadow.radius = 4;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xffc89a, 1.4); rim.position.set(-3, 3, -4); scene.add(rim);

  // plinth
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.32, 0.12, 64), mat(0xf3ece1, 0.9));
  base.position.y = -0.06; base.receiveShadow = true; scene.add(base);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.29, 0.025, 12, 96), mat(C.jacket, 0.5));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.0; scene.add(ring);

  const rider = new THREE.Group(); scene.add(rider);
  const parts = {};

  const add = (parent, geo, material, pos = [0, 0, 0], opts = {}) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    if (opts.rot) m.rotation.set(...opts.rot);
    if (opts.scale) m.scale.set(...opts.scale);
    m.castShadow = opts.shadow !== false; m.receiveShadow = true;
    parent.add(m); return m;
  };
  const group = (parent, tag, pos = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...pos); g.userData.tag = tag; parent.add(g); parts[tag] = g; return g; };
  const limb = (parent, a, b, r, material) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
    const m = add(parent, new THREE.CapsuleGeometry(r, Math.max(0.01, len - r), 6, 14), material, A.clone().add(B).multiplyScalar(0.5).toArray());
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  };

  const skin = mat(C.skin, 0.6), hairM = mat(C.hair, 0.55), jacketM = mat(C.jacket, 0.62), jacketDeepM = mat(C.jacketDeep, 0.62);

  // legs + boots
  const legs = group(rider, "boots");
  for (const x of [-0.15, 0.15]) {
    limb(legs, [x, 0.2, 0], [x, 0.86, 0], 0.12, mat(C.pants, 0.85));
    add(legs, new THREE.CapsuleGeometry(0.105, 0.16, 6, 12), mat(C.boots, 0.7), [x, 0.1, 0.06], { rot: [Math.PI / 2, 0, 0] });
  }
  add(legs, new THREE.SphereGeometry(0.27, 24, 16), mat(C.pants, 0.85), [0, 0.9, 0], { scale: [1.15, 0.6, 0.8] });

  // the burnt-orange puffer
  const jacket = group(rider, "jacket");
  const torso = add(jacket, new THREE.CapsuleGeometry(0.34, 0.42, 10, 24), jacketM, [0, 1.28, 0], { scale: [1.06, 1, 0.8] });
  for (const [y, r] of [[1.0, 0.35], [1.16, 0.37], [1.32, 0.37], [1.48, 0.35]]) {
    add(jacket, new THREE.TorusGeometry(r, 0.055, 12, 36), jacketDeepM, [0, y, 0], { rot: [Math.PI / 2, 0, 0], scale: [1.06, 0.8, 1] });
  }
  add(jacket, new THREE.TorusGeometry(0.19, 0.075, 12, 28), jacketM, [0, 1.68, 0], { rot: [Math.PI / 2, 0, 0] });
  add(jacket, new THREE.BoxGeometry(0.018, 0.6, 0.02), mat(0x7a2f10, 0.6), [0, 1.3, 0.285]);
  // crossbody strap
  add(jacket, new THREE.TorusGeometry(0.44, 0.02, 8, 48), mat(C.strap, 0.5), [0, 1.3, 0], { rot: [Math.PI / 2, 0.55, 0], scale: [1.0, 0.82, 1] });

  // arms: right hand holds coffee, left arm carries the camo lid
  const shoulderL = [0.38, 1.56, 0], shoulderR = [-0.38, 1.56, 0];
  for (const s of [shoulderL, shoulderR]) add(jacket, new THREE.SphereGeometry(0.15, 18, 14), jacketM, s);
  limb(jacket, shoulderR, [-0.5, 1.22, 0.08], 0.12, jacketM);
  limb(jacket, [-0.5, 1.22, 0.08], [-0.3, 1.3, 0.34], 0.105, jacketM);
  limb(jacket, shoulderL, [0.54, 1.2, 0.02], 0.12, jacketM);
  limb(jacket, [0.54, 1.2, 0.02], [0.46, 1.0, 0.24], 0.105, jacketM);
  add(jacket, new THREE.SphereGeometry(0.085, 16, 12), skin, [-0.27, 1.32, 0.42]);
  add(jacket, new THREE.SphereGeometry(0.085, 16, 12), skin, [0.44, 0.98, 0.32]);

  // coffee
  const coffee = group(rider, "coffee", [-0.24, 1.36, 0.47]);
  add(coffee, new THREE.CylinderGeometry(0.075, 0.058, 0.2, 24), mat(C.cup, 0.5));
  add(coffee, new THREE.CylinderGeometry(0.079, 0.072, 0.07, 24), mat(C.sleeve, 0.8), [0, -0.01, 0]);
  add(coffee, new THREE.CylinderGeometry(0.08, 0.08, 0.02, 24), mat(0x3a2a22, 0.4), [0, 0.105, 0]);
  const steam = [];
  for (let i = 0; i < 4; i++) {
    const p = add(coffee, new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }), [0, 0.15, 0], { shadow: false });
    p.userData.phase = i / 4; steam.push(p);
  }

  // his camo helmet, under the left arm
  const helmet = group(rider, "helmet", [0.66, 1.06, 0.18]);
  helmet.rotation.set(0.1, -0.9, 0.25);
  add(helmet, new THREE.SphereGeometry(0.25, 32, 24), mat(0xffffff, 0.35, 0, { map: camoTexture() }), [0, 0, 0], { scale: [1, 1.05, 1.1] });
  add(helmet, new THREE.SphereGeometry(0.16, 24, 16), mat(0x1f2d36, 0.12, 0.4), [0, 0.03, 0.21], { scale: [1.25, 0.72, 0.5] });
  add(helmet, new THREE.SphereGeometry(0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xeef0ef, 0.4), [0, 0.16, 0.2], { rot: [-0.55, 0, 0], scale: [1.05, 0.12, 1.0] });
  add(helmet, new THREE.CapsuleGeometry(0.06, 0.18, 6, 12), mat(0xa5abae, 0.5), [0, -0.16, 0.2], { rot: [0, 0, Math.PI / 2] });
  add(helmet, new THREE.BoxGeometry(0.07, 0.05, 0.05), mat(0x1b1d1e, 0.4), [0, -0.24, 0.27]);   // GoPro mount
  add(helmet, new THREE.BoxGeometry(0.06, 0.09, 0.1), mat(0x1b1d1e, 0.4), [-0.25, -0.02, 0]);   // intercom

  // guitar on his back
  const guitar = group(rider, "guitar", [0.05, 1.18, -0.36]);
  guitar.rotation.set(0, 0, -0.55);
  add(guitar, new THREE.SphereGeometry(0.27, 28, 20), mat(C.wood, 0.45), [0, -0.16, 0], { scale: [1, 1.05, 0.32] });
  add(guitar, new THREE.SphereGeometry(0.21, 28, 20), mat(C.wood, 0.45), [0, 0.17, 0], { scale: [1, 1, 0.32] });
  add(guitar, new THREE.CircleGeometry(0.07, 24), mat(0x1a1310, 0.9), [0, 0.02, -0.071], { rot: [0, Math.PI, 0], shadow: false });
  add(guitar, new THREE.BoxGeometry(0.065, 0.72, 0.045), mat(C.woodDark, 0.5), [0, 0.68, 0]);
  add(guitar, new THREE.BoxGeometry(0.1, 0.16, 0.05), mat(0x2a1c12, 0.5), [0, 1.1, 0]);

  // head
  const head = group(rider, "face", [0, 2.0, 0.02]);
  add(rider, new THREE.CylinderGeometry(0.1, 0.11, 0.18, 16), skin, [0, 1.74, 0]);
  add(head, new THREE.SphereGeometry(0.3, 32, 24), skin, [0, 0, 0], { scale: [0.95, 1.08, 1] });
  const ears = [];
  for (const x of [-0.29, 0.29]) ears.push(add(head, new THREE.SphereGeometry(0.06, 14, 10), skin, [x, -0.01, 0], { scale: [0.5, 1, 0.8] }));
  const plug = group(head, "earplug", [0.305, -0.07, 0.01]);
  add(plug, new THREE.CylinderGeometry(0.026, 0.026, 0.03, 16), mat(0x0e0e0e, 0.3), [0, 0, 0], { rot: [0, 0, Math.PI / 2] });

  const hair = group(head, "hair");
  add(hair, new THREE.SphereGeometry(0.27, 24, 16), hairM, [0, 0.2, -0.04], { scale: [1.18, 0.72, 1.15] });
  add(hair, new THREE.SphereGeometry(0.29, 24, 16), hairM, [0, 0.04, -0.15]);
  for (const x of [-1, 1]) {
    add(hair, new THREE.SphereGeometry(0.13, 16, 12), hairM, [0.25 * x, 0.03, -0.06], { scale: [0.75, 1.4, 1] });
    add(hair, new THREE.SphereGeometry(0.12, 16, 12), hairM, [0.22 * x, -0.17, -0.12], { scale: [0.8, 1.3, 1] });
  }
  add(hair, new THREE.SphereGeometry(0.12, 16, 12), hairM, [0.07, 0.27, 0.15], { scale: [1.7, 0.6, 0.9], rot: [0, 0, -0.25] });
  add(hair, new THREE.SphereGeometry(0.1, 16, 12), hairM, [-0.12, 0.26, 0.13], { scale: [1.4, 0.55, 0.9], rot: [0, 0, 0.3] });

  const beard = group(head, "beard");
  add(beard, new THREE.SphereGeometry(0.275, 32, 24), mat(0xffffff, 0.95, 0, { map: saltPepperTexture() }), [0, -0.15, 0.06], { scale: [1.0, 0.85, 0.92] });
  add(beard, new THREE.CapsuleGeometry(0.035, 0.15, 6, 12), mat(C.beardDark, 0.9), [0, -0.035, 0.27], { rot: [0, 0, Math.PI / 2] });

  const smile = group(head, "smile", [0, -0.1, 0.302]);
  add(smile, new THREE.TorusGeometry(0.07, 0.019, 8, 24, Math.PI), mat(0xc4685a, 0.5), [0, 0, 0.004], { rot: [0, 0, Math.PI], shadow: false });

  add(head, new THREE.SphereGeometry(0.05, 14, 10), skin, [0, 0.0, 0.3], { scale: [0.85, 1, 1] });
  const eyes = [];
  for (const x of [-0.1, 0.1]) {
    eyes.push(add(head, new THREE.SphereGeometry(0.034, 14, 10), mat(0x1a1410, 0.2), [x, 0.07, 0.262], { shadow: false }));
    add(head, new THREE.SphereGeometry(0.01, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), [x + 0.012, 0.082, 0.293], { shadow: false });
    add(head, new THREE.BoxGeometry(0.11, 0.028, 0.03), hairM, [x, 0.145, 0.262], { rot: [0, 0, x > 0 ? -0.12 : 0.12], shadow: false });
  }

  // ---------- interaction: drag to spin, tap a part ----------
  let yaw = -0.5, vel = 0, dragging = false, lastX = 0, downX = 0, downY = 0, idle = 0;
  const el = renderer.domElement;
  el.addEventListener("pointerdown", (e) => { dragging = true; lastX = downX = e.clientX; downY = e.clientY; el.setPointerCapture(e.pointerId); idle = 0; });
  el.addEventListener("pointermove", (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; yaw += dx * 0.012; vel = dx * 0.012; });
  el.addEventListener("pointerup", (e) => {
    dragging = false;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
    const r = el.getBoundingClientRect();
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObject(rider, true)[0];
    let o = hit && hit.object;
    while (o && !o.userData.tag) o = o.parent;
    if (o) { pop(o); onPick && onPick(o.userData.tag); }
  });
  const pops = [];
  function pop(o) { pops.push({ o, t: 0, s: o.scale.x }); }

  // ---------- life ----------
  const clock = new THREE.Clock();
  let blinkAt = 2, running = true;
  function tick() {
    if (!running) return;
    const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    idle += dt;
    if (!dragging) { yaw += vel; vel *= 0.92; if (idle > 2.5) yaw += dt * 0.45; }
    rider.rotation.y = yaw;
    torso.scale.y = 1 + Math.sin(t * 2.2) * 0.012;
    head.rotation.z = Math.sin(t * 0.9) * 0.05;
    head.rotation.x = Math.sin(t * 0.7) * 0.03;
    head.position.y = 2.0 + Math.sin(t * 2.2) * 0.006;
    if (t > blinkAt) { const k = Math.min(1, (t - blinkAt) / 0.14); const s = k < 0.5 ? 1 - k * 1.8 : 0.1 + (k - 0.5) * 1.8; eyes.forEach((e) => (e.scale.y = Math.max(0.1, s))); if (k >= 1) { blinkAt = t + 2.5 + Math.random() * 3; eyes.forEach((e) => (e.scale.y = 1)); } }
    steam.forEach((p) => { const k = (t * 0.5 + p.userData.phase) % 1; p.position.set(Math.sin(k * 9 + p.userData.phase * 6) * 0.03, 0.14 + k * 0.32, 0); p.scale.setScalar(0.6 + k * 1.4); p.material.opacity = 0.55 * (1 - k); });
    for (let i = pops.length - 1; i >= 0; i--) {
      const q = pops[i]; q.t += dt; const k = q.t / 0.45;
      const s = q.s * (1 + Math.sin(Math.min(1, k) * Math.PI) * 0.22); q.o.scale.setScalar(s);
      if (k >= 1) { q.o.scale.setScalar(q.s); pops.splice(i, 1); }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  const onResize = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); };
  addEventListener("resize", onResize);
  return {
    pause() { running = false; },
    resume() { if (!running) { running = true; clock.getDelta(); tick(); } },
    poke(tag) { if (parts[tag]) pop(parts[tag]); },
    face(y) { yaw = y; vel = 0; idle = -30; },
    resize: onResize,
  };
}
