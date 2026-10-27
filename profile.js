// Rider profile: a 3D Saurabh you can spin, poke and dress (ride kit / off duty).
// Built in code from shapes and canvas textures, so it loads offline from the site itself.
import * as THREE from "./three.module.min.js?v=160";   // versioned so a stale cached copy is never reused

const COL = {
  skin: 0xbf8a6c, hair: 0x241912, beard: 0x1e1915,
  jacket: 0xe0662c, jacketDeep: 0xc4521f, pantsDark: 0x23262a, boots: 0x3d2b21,
  mint: 0x8fe0c8, sneaker: 0xeeede8,
};

const std = (color, rough = 0.7, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  t.anisotropy = 4; return t;
}
let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

// the charcoal check of his crossbody bag
const checkTex = () => canvasTex(256, 256, (g, w) => {
  g.fillStyle = "#2b2c2e"; g.fillRect(0, 0, w, w);
  g.fillStyle = "rgba(120,122,126,.55)";
  for (const x of [40, 168]) { g.fillRect(x, 0, 34, w); g.fillRect(0, x, w, 34); }
  g.fillStyle = "rgba(15,15,16,.85)";
  for (const x of [100, 228]) { g.fillRect(x, 0, 14, w); g.fillRect(0, x, w, 14); }
  g.strokeStyle = "rgba(210,210,212,.5)"; g.lineWidth = 2;
  for (const x of [57, 185]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, w); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); }
}, [2, 2]);

const denimTex = () => canvasTex(256, 256, (g, w) => {
  g.fillStyle = "#86acd4"; g.fillRect(0, 0, w, w);
  for (let i = 0; i < 5000; i++) { g.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,.12)" : "rgba(30,60,110,.12)"; g.fillRect(rnd() * w, rnd() * w, 1 + rnd() * 3, 1); }
  for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(rnd() * w, rnd() * w, 18, 3); }   // light distressing
}, [2, 3]);

const teeTex = () => canvasTex(512, 256, (g, w, h) => {
  g.fillStyle = "#bfd7ee"; g.fillRect(0, 0, w, h);
  // mint chevron band across the chest (the front is the middle of the texture)
  g.fillStyle = "#8fe0c8"; g.beginPath();
  g.moveTo(w * 0.28, h * 0.22); g.lineTo(w * 0.5, h * 0.52); g.lineTo(w * 0.72, h * 0.22);
  g.lineTo(w * 0.72, h * 0.0); g.lineTo(w * 0.28, h * 0.0); g.closePath(); g.fill();
  g.strokeStyle = "#2d3a46"; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.28, h * 0.24); g.lineTo(w * 0.5, h * 0.54); g.lineTo(w * 0.72, h * 0.24); g.stroke();
}, [1, 1]);

const camoTex = () => canvasTex(256, 256, (g, w) => {
  g.fillStyle = "#f1f2f0"; g.fillRect(0, 0, w, w);
  for (let i = 0; i < 26; i++) {
    g.fillStyle = i % 2 ? "#8d9497" : "#2a2f31"; g.beginPath();
    const x = rnd() * w, y = rnd() * w, r = 10 + rnd() * 18;
    for (let a = 0; a < 6.3; a += 0.5) { const rr = r * (0.65 + rnd() * 0.6); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.fill();
  }
});

const footballTex = () => canvasTex(512, 256, (g, w, h) => {
  g.fillStyle = "#f7f7f4"; g.fillRect(0, 0, w, h);
  const pent = (cx, cy, r, sx) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; g.lineTo(cx + Math.cos(a) * r * sx, cy + Math.sin(a) * r); } g.closePath(); g.fill(); };
  g.fillStyle = "#1b1b1b";
  pent(w * 0.25, h * 0.02, 22, 4); pent(w * 0.75, h * 0.98, 22, 4);        // poles (stretched by the projection)
  for (let i = 0; i < 5; i++) { pent(w * (i / 5 + 0.05), h * 0.33, 26, 1.3); pent(w * (i / 5 + 0.15), h * 0.67, 26, 1.3); }
  g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 2;
  for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(w * (i / 10), h * 0.33); g.lineTo(w * (i / 10 + 0.05), h * 0.67); g.stroke(); }
});

const beardTex = () => canvasTex(256, 256, (g, w) => {
  g.fillStyle = "#1e1915"; g.fillRect(0, 0, w, w);
  for (let i = 0; i < 3000; i++) {
    g.strokeStyle = rnd() < 0.12 ? "rgba(170,165,160,.55)" : rnd() < 0.5 ? "rgba(60,45,35,.6)" : "rgba(5,4,4,.6)";
    const x = rnd() * w, y = rnd() * w; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 2, y + 3 + rnd() * 5); g.stroke();
  }
});

export function mountRider(container, onPick) {
  const W = () => container.clientWidth, H = () => container.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = "none";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, W() / H(), 0.05, 30);
  camera.position.set(0, 1.25, 4.15);
  camera.lookAt(0, 0.88, 0);

  scene.add(new THREE.HemisphereLight(0xfff3e4, 0x8f7d66, 1.15));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.6); key.position.set(1.8, 3.2, 2.6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -1.2, right: 1.2, top: 2.2, bottom: -0.3 }); key.shadow.bias = -0.0004; key.shadow.radius = 3;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9dcff, 0.6); fill.position.set(-2.5, 1.5, 2); scene.add(fill);
  const rimLight = new THREE.DirectionalLight(0xffc89a, 1.6); rimLight.position.set(-1.5, 2.5, -3); scene.add(rimLight);

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.82, 0.08, 64), std(0xf3ece1, 0.9));
  plinth.position.y = -0.04; plinth.receiveShadow = true; scene.add(plinth);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.014, 10, 96), std(COL.jacket, 0.5));
  ring.rotation.x = Math.PI / 2; scene.add(ring);

  const rider = new THREE.Group(); scene.add(rider);
  const parts = {};
  const add = (parent, geo, material, pos = [0, 0, 0], o = {}) => {
    const m = new THREE.Mesh(geo, material); m.position.set(...pos);
    if (o.rot) m.rotation.set(...o.rot); if (o.scale) m.scale.set(...o.scale);
    m.castShadow = o.shadow !== false; m.receiveShadow = true; parent.add(m); return m;
  };
  const group = (parent, tag, pos = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...pos); if (tag) { g.userData.tag = tag; parts[tag] = g; } parent.add(g); return g; };
  const limb = (parent, a, b, r, material, r2) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
    const geo = r2 ? new THREE.CylinderGeometry(r2, r, len, 20, 1) : new THREE.CapsuleGeometry(r, Math.max(0.001, len - r), 8, 18);
    const m = add(parent, geo, material, A.clone().add(B).multiplyScalar(0.5).toArray());
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    if (r2) { add(parent, new THREE.SphereGeometry(r, 18, 12), material, a); add(parent, new THREE.SphereGeometry(r2, 18, 12), material, b); }
    return m;
  };
  const lathe = (profile, segs = 48) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segs);

  const skin = std(COL.skin, 0.55);
  const outfits = { ride: group(rider, null), duty: group(rider, null) };

  // ================= shared: neck, head, forearms (hands in pockets) =================
  const body = group(rider, null);
  add(body, new THREE.CylinderGeometry(0.048, 0.055, 0.12, 20), skin, [0, 1.47, 0.005]);

  // ---------- head ----------
  const head = group(body, "face", [0, 1.6, 0.012]);
  const skull = new THREE.SphereGeometry(0.1, 48, 36);
  { // shape a jaw and cheekbones into the sphere
    const p = skull.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const down = Math.max(0, -v.y / 0.1);
      v.x *= 0.92 - down * 0.1; v.y *= 1.18; v.z *= 1.02 - down * 0.06;
      if (v.z > 0.05 && Math.abs(v.y) < 0.03) v.z += 0.004;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    skull.computeVertexNormals();
  }
  add(head, skull, skin);
  for (const x of [-1, 1]) add(head, new THREE.SphereGeometry(0.026, 16, 12), skin, [0.091 * x, 0.0, -0.005], { scale: [0.45, 1, 0.8] });
  const plug = group(head, "earplug", [0.1, -0.02, 0.0]);
  add(plug, new THREE.CylinderGeometry(0.011, 0.011, 0.012, 16), std(0x0c0c0c, 0.3), [0, 0, 0], { rot: [0, 0, Math.PI / 2] });
  add(head, new THREE.SphereGeometry(0.02, 16, 12), skin, [0, 0.0, 0.103], { scale: [0.75, 1.5, 1.1] });
  add(head, new THREE.SphereGeometry(0.019, 16, 12), skin, [0, -0.022, 0.111]);
  for (const x of [-1, 1]) add(head, new THREE.SphereGeometry(0.011, 10, 8), skin, [0.014 * x, -0.027, 0.104]);
  // eyes (seen in ride kit; aviators cover them off duty)
  for (const x of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.011, 14, 10), std(0x15100c, 0.2), [0.036 * x, 0.022, 0.093], { shadow: false });
    add(head, new THREE.SphereGeometry(0.0035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), [0.036 * x + 0.004, 0.026, 0.103], { shadow: false });
  }
  for (const x of [-1, 1]) add(head, new THREE.CapsuleGeometry(0.007, 0.034, 4, 8), std(COL.hair, 0.6), [0.04 * x, 0.05, 0.096], { rot: [0, 0.25 * x, Math.PI / 2 + 0.1 * x] });

  // aviators
  const shades = group(head, "shades", [0, 0.022, 0.106]);
  const lensShape = new THREE.Shape();
  lensShape.moveTo(-0.027, 0.012); lensShape.bezierCurveTo(-0.01, 0.017, 0.02, 0.016, 0.028, 0.008);
  lensShape.bezierCurveTo(0.033, -0.01, 0.018, -0.028, 0.0, -0.028); lensShape.bezierCurveTo(-0.022, -0.026, -0.03, -0.006, -0.027, 0.012);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x4e78a8, metalness: 0.95, roughness: 0.08, side: THREE.DoubleSide });
  const frameMat = std(0x1a1a1a, 0.3, 0.8);
  for (const x of [-1, 1]) {
    add(shades, new THREE.ShapeGeometry(lensShape, 24), lensMat, [0.036 * x, 0, 0], { rot: [0, 0.22 * x, 0], scale: [x, 1, 1], shadow: false });
    const pts = lensShape.getPoints(40).map((p) => new THREE.Vector3(p.x, p.y, 0));
    add(shades, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 60, 0.0017, 6, true), frameMat, [0.036 * x, 0, 0.001], { rot: [0, 0.22 * x, 0], scale: [x, 1, 1], shadow: false });
    add(shades, new THREE.CylinderGeometry(0.0015, 0.0015, 0.1, 6), frameMat, [0.064 * x, 0.008, -0.05], { rot: [Math.PI / 2, 0, 0], shadow: false });
  }
  add(shades, new THREE.CylinderGeometry(0.0015, 0.0015, 0.024, 6), frameMat, [0, 0.012, 0.002], { rot: [0, 0, Math.PI / 2], shadow: false });

  // full beard + moustache
  const beard = group(head, "beard");
  const beardMat = std(0xffffff, 0.95, 0, { map: beardTex() });
  add(beard, new THREE.SphereGeometry(0.103, 40, 24, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), beardMat, [0, -0.012, 0.012], { scale: [0.98, 1.25, 1.07] });
  add(beard, new THREE.SphereGeometry(0.06, 24, 16), beardMat, [0, -0.11, 0.05], { scale: [1.15, 1.05, 1.0] });
  for (const x of [-1, 1]) add(beard, new THREE.SphereGeometry(0.05, 20, 14), beardMat, [0.055 * x, -0.06, 0.05], { scale: [0.8, 1.2, 1] });
  add(beard, new THREE.TorusGeometry(0.03, 0.009, 8, 20, Math.PI), std(COL.beard, 0.9), [0, -0.036, 0.106], { rot: [0.25, 0, 0], scale: [1, 0.6, 1] });
  const smile = group(head, "smile", [0, -0.052, 0.112]);
  add(smile, new THREE.CapsuleGeometry(0.006, 0.02, 4, 10), std(0xb36a5e, 0.5), [0, 0, 0], { rot: [0, 0, Math.PI / 2], shadow: false });

  // hair: swept back, long and wavy, built from strands over a base volume
  const hair = group(head, "hair");
  const hairMat = std(COL.hair, 0.42, 0.05);
  add(hair, new THREE.SphereGeometry(0.106, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMat, [0, 0.022, -0.012], { scale: [1.0, 1.12, 1.08] });
  add(hair, new THREE.SphereGeometry(0.1, 28, 20), hairMat, [0, 0.0, -0.045], { scale: [1.05, 0.95, 0.92] });
  for (let i = 0; i < 64; i++) {
    const side = i % 2 ? 1 : -1, k = (i >> 1) / 31;
    const th = side * k * 1.35, sx = Math.sin(th), cz = Math.cos(th);
    const wav = (rnd() - 0.5) * 0.02, len = 0.95 + rnd() * 0.25;
    const pts = [
      [sx * 0.084, 0.072 - k * 0.04, cz * 0.088],
      [sx * 0.1, 0.15 - k * 0.05, cz * 0.04],          // lift off the forehead: volume on top
      [sx * 0.112 + wav, 0.13 - k * 0.06, -0.05],
      [sx * 0.12 * len, 0.04 - k * 0.04, -0.115 + wav],
      [sx * 0.125 * len + wav, -0.04 * len - k * 0.02, -0.115],
      [sx * 0.135 * len, -0.085 * len - k * 0.03, -0.085 + wav],   // ends at the collar, flicking out
    ].map((p) => new THREE.Vector3(...p));
    add(hair, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.011 + rnd() * 0.006, 6), hairMat);
  }

  // ---------- arms: relaxed, hands in pockets ----------
  const shoulders = [[-0.205, 1.395, 0], [0.205, 1.395, 0]];
  const elbows = [[-0.25, 1.14, -0.01], [0.25, 1.14, -0.01]];
  const pockets = [[-0.165, 0.95, 0.065], [0.165, 0.95, 0.065]];
  for (let s = 0; s < 2; s++) limb(body, elbows[s], pockets[s], 0.034, skin, 0.031);
  const watch = group(body, "watch", [0.177, 0.985, 0.052]);
  add(watch, new THREE.TorusGeometry(0.033, 0.009, 8, 24), std(0x111111, 0.6), [0, 0, 0], { rot: [Math.PI / 2 - 0.35, 0, 0.25] });
  add(watch, new THREE.BoxGeometry(0.032, 0.012, 0.038), std(0x0b0b0b, 0.2, 0.5), [0.02, 0.0, 0.016], { rot: [0, 0.6, 0] });
  const beads = group(body, "bracelet", [-0.177, 0.985, 0.052]);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; add(beads, new THREE.SphereGeometry(0.008, 8, 6), std(0x141414, 0.3), [Math.cos(a) * 0.033, Math.sin(a) * 0.012, Math.sin(a) * 0.03]); }

  // ================= OFF DUTY: tee, cargo denim, sneakers =================
  {
    const g = outfits.duty;
    const tee = group(g, "tee");
    const teeMap = teeTex(); teeMap.offset.x = 0.5;   // lathe u=0 faces front; centre the chevron there
    const teeMat = std(0xffffff, 0.85, 0, { map: teeMap });
    add(tee, lathe([[0.001, 0], [0.155, 0.0], [0.162, 0.12], [0.172, 0.3], [0.182, 0.42], [0.17, 0.5], [0.11, 0.555], [0.05, 0.57]]), teeMat, [0, 0.94, 0], { scale: [1, 1, 0.66] });
    for (let s = 0; s < 2; s++) {
      add(tee, new THREE.SphereGeometry(0.068, 20, 14), std(COL.mint, 0.85), shoulders[s]);
      limb(tee, shoulders[s], [shoulders[s][0] * 1.12, 1.27, 0], 0.062, std(COL.mint, 0.85));
      limb(g, [shoulders[s][0] * 1.12, 1.27, 0], elbows[s], 0.04, skin, 0.035);
    }
    const jeans = group(g, "jeans");
    const denim = std(0xffffff, 0.9, 0, { map: denimTex() });
    add(jeans, new THREE.CapsuleGeometry(0.115, 0.15, 8, 20), denim, [0, 0.92, 0], { rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.7] });
    for (const x of [-1, 1]) {
      limb(jeans, [0.095 * x, 0.9, 0], [0.1 * x, 0.12, 0.0], 0.082, denim, 0.07);
      add(jeans, new THREE.BoxGeometry(0.03, 0.13, 0.095), denim, [0.172 * x, 0.52, 0.0], { rot: [0, 0, -0.03 * x] });
    }
    const kicks = group(g, "shoes");
    for (const x of [-1, 1]) {
      add(kicks, new THREE.CapsuleGeometry(0.045, 0.16, 6, 14), std(COL.sneaker, 0.6), [0.1 * x, 0.045, 0.035], { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.8] });
      add(kicks, new THREE.BoxGeometry(0.1, 0.018, 0.25), std(0xd9d6cf, 0.8), [0.1 * x, 0.009, 0.035]);
    }
  }

  // ================= RIDE KIT: orange puffer, dark trousers, boots, helmet =================
  {
    const g = outfits.ride;
    const jacket = group(g, "jacket");
    const orange = std(COL.jacket, 0.6), deep = std(COL.jacketDeep, 0.6);
    add(jacket, lathe([[0.001, 0], [0.18, 0.0], [0.19, 0.12], [0.2, 0.3], [0.205, 0.42], [0.19, 0.5], [0.12, 0.56], [0.07, 0.6]]), orange, [0, 0.9, 0], { scale: [1, 1, 0.72] });
    for (const [y, r] of [[0.98, 0.188], [1.08, 0.196], [1.18, 0.2], [1.28, 0.203], [1.37, 0.196]]) add(jacket, new THREE.TorusGeometry(r, 0.024, 10, 40), deep, [0, y, 0], { rot: [Math.PI / 2, 0, 0], scale: [1, 0.72, 1] });
    add(jacket, new THREE.TorusGeometry(0.075, 0.035, 10, 24), orange, [0, 1.46, 0], { rot: [Math.PI / 2, 0, 0] });
    add(jacket, new THREE.BoxGeometry(0.008, 0.5, 0.01), std(0x7a2f10, 0.6), [0, 1.17, 0.147]);
    for (let s = 0; s < 2; s++) {
      add(jacket, new THREE.SphereGeometry(0.08, 20, 14), orange, shoulders[s]);
      limb(jacket, shoulders[s], elbows[s], 0.07, orange);
      limb(jacket, elbows[s], [pockets[s][0] * 1.03, 1.0, 0.05], 0.06, orange, 0.052);
    }
    const trousers = std(COL.pantsDark, 0.85);
    add(g, new THREE.CapsuleGeometry(0.115, 0.15, 8, 20), trousers, [0, 0.9, 0], { rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.7] });
    for (const x of [-1, 1]) limb(g, [0.095 * x, 0.88, 0], [0.1 * x, 0.14, 0], 0.08, trousers, 0.068);
    const boots = group(g, "boots");
    for (const x of [-1, 1]) {
      add(boots, new THREE.CylinderGeometry(0.065, 0.07, 0.16, 18), std(COL.boots, 0.7), [0.1 * x, 0.1, 0]);
      add(boots, new THREE.CapsuleGeometry(0.05, 0.15, 6, 14), std(COL.boots, 0.7), [0.1 * x, 0.045, 0.04], { rot: [Math.PI / 2, 0, 0] });
    }
    const helmet = group(g, "helmet", [0.42, 0.13, 0.18]);
    helmet.rotation.set(0, -0.6, 0);
    add(helmet, new THREE.SphereGeometry(0.135, 32, 24), std(0xffffff, 0.35, 0, { map: camoTex() }), [0, 0, 0], { scale: [1, 1.05, 1.1] });
    add(helmet, new THREE.SphereGeometry(0.09, 24, 16), std(0x1f2d36, 0.1, 0.5), [0, 0.02, 0.11], { scale: [1.25, 0.7, 0.5] });
    add(helmet, new THREE.SphereGeometry(0.11, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(0xeef0ef, 0.4), [0, 0.09, 0.1], { rot: [-0.55, 0, 0], scale: [1.05, 0.12, 1] });
    add(helmet, new THREE.CapsuleGeometry(0.035, 0.1, 6, 12), std(0xa5abae, 0.5), [0, -0.09, 0.11], { rot: [0, 0, Math.PI / 2] });
    add(helmet, new THREE.BoxGeometry(0.04, 0.03, 0.03), std(0x1b1d1e, 0.4), [0, -0.13, 0.15]);
  }

  // off duty: a football by his feet
  const football = group(outfits.duty, "football", [-0.2, 0.105, 0.38]);
  add(football, new THREE.SphereGeometry(0.105, 40, 28), std(0xffffff, 0.45, 0, { map: footballTex() }));

  // coffee, waiting on the plinth
  const coffee = group(rider, "coffee", [-0.4, 0.085, 0.25]);
  add(coffee, new THREE.CylinderGeometry(0.042, 0.032, 0.12, 24), std(0xf4efe6, 0.5));
  add(coffee, new THREE.CylinderGeometry(0.044, 0.04, 0.04, 24), std(0x8b5a3c, 0.8), [0, -0.005, 0]);
  add(coffee, new THREE.CylinderGeometry(0.045, 0.045, 0.012, 24), std(0x3a2a22, 0.4), [0, 0.065, 0]);
  const steam = [];
  for (let i = 0; i < 4; i++) { const p = add(coffee, new THREE.SphereGeometry(0.016, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }), [0, 0.08, 0], { shadow: false }); p.userData.phase = i / 4; steam.push(p); }

  // the charcoal check crossbody bag, worn across the chest in both outfits
  const bag = group(rider, "bag");
  {
    const s = new THREE.Shape(), w = 0.13, h = 0.065, r = 0.03;
    s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.016, bevelSegments: 4, curveSegments: 10 });
    geo.center();
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * 4);
    add(bag, geo, std(0xffffff, 0.75, 0, { map: checkTex() }));
    add(bag, new THREE.BoxGeometry(0.24, 0.004, 0.004), std(0xc9c9c9, 0.3, 0.9), [0, 0.035, 0.043]);
    add(bag, new THREE.BoxGeometry(0.2, 0.004, 0.004), std(0xc9c9c9, 0.3, 0.9), [0, -0.005, 0.043]);
    add(bag, new THREE.BoxGeometry(0.012, 0.022, 0.006), std(0xc9c9c9, 0.3, 0.9), [0.09, 0.025, 0.046]);
  }
  const strapMat = std(0x111213, 0.55);
  let strap = null;
  function fitBag(outfit) {
    const puff = outfit === "ride";
    const z = puff ? 0.19 : 0.145;
    bag.position.set(-0.03, 1.0, z); bag.rotation.set(-0.12, 0, 0.12);
    if (strap) { rider.remove(strap); strap.geometry.dispose(); }
    const zf = z - 0.01, zb = puff ? -0.17 : -0.135;
    const pts = [[-0.14, 1.0, zf], [-0.02, 1.16, zf + 0.01], [0.08, 1.33, zf - 0.02], [0.13, 1.47, 0.05], [0.12, 1.47, -0.06], [0.0, 1.27, zb], [-0.13, 1.08, zb + 0.02], [-0.19, 1.0, 0.0], [-0.14, 1.0, zf]];
    strap = add(rider, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), true), 120, 0.009, 6, true), strapMat);
    strap.userData.tag = "bag";
  }

  // guitar slung on his back
  const guitar = group(rider, "guitar", [0.02, 1.08, -0.2]);
  guitar.rotation.set(0.05, 0, -0.55);
  const wood = std(0xc98a4b, 0.4), woodDark = std(0x4a2e1b, 0.5);
  add(guitar, new THREE.CylinderGeometry(0.16, 0.16, 0.08, 40), wood, [0, -0.1, 0], { rot: [Math.PI / 2, 0, 0] });
  add(guitar, new THREE.CylinderGeometry(0.125, 0.125, 0.08, 40), wood, [0, 0.12, 0], { rot: [Math.PI / 2, 0, 0] });
  add(guitar, new THREE.CylinderGeometry(0.045, 0.045, 0.002, 28), std(0x120c08, 0.9), [0, 0.03, -0.041], { rot: [Math.PI / 2, 0, 0], shadow: false });
  add(guitar, new THREE.BoxGeometry(0.045, 0.42, 0.03), woodDark, [0, 0.45, -0.01]);
  add(guitar, new THREE.BoxGeometry(0.06, 0.1, 0.03), std(0x24170e, 0.5), [0, 0.7, -0.01]);

  // ---------- outfits ----------
  function setOutfit(name) {
    outfits.ride.visible = name === "ride";
    outfits.duty.visible = name === "duty";
    shades.visible = name === "duty";
    fitBag(name);
  }
  setOutfit("ride");

  // ---------- interaction ----------
  let yaw = -0.45, vel = 0, dragging = false, lastX = 0, downX = 0, downY = 0, idle = 0;
  const el = renderer.domElement;
  el.addEventListener("pointerdown", (e) => { dragging = true; lastX = downX = e.clientX; downY = e.clientY; el.setPointerCapture(e.pointerId); idle = 0; });
  el.addEventListener("pointermove", (e) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; yaw += dx * 0.012; vel = dx * 0.012; });
  const isShown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  el.addEventListener("pointerup", (e) => {
    dragging = false;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
    const r = el.getBoundingClientRect(), ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObject(rider, true).find((h) => isShown(h.object));
    let o = hit && hit.object;
    while (o && !o.userData.tag) o = o.parent;
    if (o) { pop(parts[o.userData.tag] || o); onPick && onPick(o.userData.tag); }
  });
  const pops = [];
  const pop = (o) => pops.push({ o, t: 0, s: o.scale.clone() });

  const clock = new THREE.Clock();
  let running = true;
  function tick() {
    if (!running) return;
    const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    idle += dt;
    if (!dragging) { yaw += vel; vel *= 0.92; if (idle > 2.5) yaw += dt * 0.4; }
    rider.rotation.y = yaw;
    football.rotation.y = t * 0.6;
    body.position.y = Math.sin(t * 1.9) * 0.002;
    head.rotation.set(Math.sin(t * 0.7) * 0.03, Math.sin(t * 0.45) * 0.12, Math.sin(t * 0.9) * 0.025);
    steam.forEach((p) => { const k = (t * 0.5 + p.userData.phase) % 1; p.position.set(Math.sin(k * 9 + p.userData.phase * 6) * 0.012, 0.08 + k * 0.16, 0); p.scale.setScalar(0.6 + k * 1.4); p.material.opacity = 0.55 * (1 - k); });
    for (let i = pops.length - 1; i >= 0; i--) {
      const q = pops[i]; q.t += dt; const k = Math.min(1, q.t / 0.45), b = 1 + Math.sin(k * Math.PI) * 0.18;
      q.o.scale.set(q.s.x * b, q.s.y * b, q.s.z * b);
      if (k >= 1) { q.o.scale.copy(q.s); pops.splice(i, 1); }
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
    resize: onResize,
    setOutfit,
    face(y) { yaw = y; vel = 0; idle = -30; },
  };
}
