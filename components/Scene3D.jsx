'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
function box(sc, w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  sc.add(m);
  return m;
}
function trees(sc, pts) {
  const tm = std(0x4a3524), lm = std(0x2f6b4a, { roughness: 0.9 });
  pts.forEach(([x, z], i) => {
    box(sc, 0.3, 1.4, 0.3, tm, x, 0.7, z);
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + (i % 3) * 0.2, 1), lm);
    l.position.set(x, 2.1, z);
    l.castShadow = true;
    sc.add(l);
  });
}

// Сграда на етажи: ново строителство, ремонт, хотел
function tower(sc, G, o) {
  const { floors, per, W, D, H = 2.3 } = o;
  const M = { raw: std(o.raw || 0x8a8f99, { roughness: 0.95 }), fin: std(o.fin || 0xece6da, { roughness: 0.7 }), slab: std(o.slabC || 0x3a3f4b) };
  box(sc, W + 7, 0.12, D + 7, std(0x1c2639, { roughness: 0.9 }), 0, 0.06, 0);
  const fl = [], wins = [], extras = [];
  for (let f = 0; f < floors; f++) {
    const body = box(sc, W, H - 0.25, D, G, 0, f * H + H / 2, 0);
    body.geometry = new THREE.BoxGeometry(W, H - 0.25, D, per, 1, 3);
    const slab = box(sc, W + 0.6, 0.25, D + 0.6, M.slab, 0, (f + 1) * H - 0.12, 0);
    fl.push({ body, slab });
    for (let i = 0; i < per; i++) {
      const m = std(0x1a2740, { roughness: 0.15, metalness: 0.6 });
      const x = -W / 2 + (W / per) * (i + 0.5), y = f * H + H / 2, ww = (W / per) * 0.66;
      const group = [];
      [1, -1].forEach((sd) => {
        const w = box(sc, ww, 1.35, 0.08, m, x, y, sd * (D / 2 + 0.03));
        w.castShadow = false;
        group.push(w);
        extras.push(box(sc, ww + 0.4, 0.5, 0.7, M.slab, x, y - 0.75, sd * (D / 2 + 0.36)));
      });
      wins.push({ m, group });
    }
  }
  extras.push(box(sc, W * 0.4, 1.2, D * 0.5, M.fin, 0, floors * H + 0.6, 0));
  extras.push(box(sc, 2.2, 1.9, 0.6, std(0xd8b36a, { metalness: 0.7, roughness: 0.3 }), 0, 0.95, D / 2 + 0.3));
  // кран или скеле
  const crane = new THREE.Group();
  const cm = std(0xe0a82e, { roughness: 0.5 });
  const top = floors * H + 6;
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.5, top, 0.5), cm);
  mast.position.y = top / 2;
  const jib = new THREE.Mesh(new THREE.BoxGeometry(W + 1, 0.4, 0.4), cm);
  jib.position.set(W / 2 - 3, top - 0.5, 0);
  const hook = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), M.raw);
  hook.position.set(W - 5, top - 5, 0);
  crane.add(mast, jib, hook);
  crane.position.set(-W / 2 - 3, 0, -D / 2 - 2);
  sc.add(crane);
  const scaf = new THREE.Mesh(new THREE.BoxGeometry(W + 1.6, floors * H, D + 1.6, 8, floors * 2, 4), new THREE.MeshBasicMaterial({ color: 0xe0a82e, wireframe: true, transparent: true, opacity: 0.5 }));
  scaf.position.y = (floors * H) / 2;
  sc.add(scaf);
  if (o.pool) {
    box(sc, 7, 0.3, 4, std(0x2aa7d8, { roughness: 0.1, metalness: 0.3, emissive: 0x0b5a7a, emissiveIntensity: 0.6 }), W / 2 - 2, 0.2, D / 2 + 5);
    box(sc, 8, 0.2, 5, std(0xd9cfb8), W / 2 - 2, 0.1, D / 2 + 5);
  }
  trees(sc, o.trees || [[-W / 2 - 5, D], [W / 2 + 5, D - 2], [-W / 2 - 4, -D - 1], [W / 2 + 4, -D], [0, D + 6]]);
  return {
    target: [0, (floors * H) / 2, 0],
    cam: [W * 1.45, floors * H * 0.9 + 4, W * 1.75],
    tick: (t) => (crane.rotation.y = Math.sin(t * 0.3) * 0.5),
    update: (stage, frac) => {
      const solid = o.solid[stage];
      const fin = stage >= o.finFrom;
      fl.forEach((f, i) => {
        f.body.material = i < solid ? (fin ? M.fin : M.raw) : G;
        f.slab.visible = i < solid;
      });
      extras.forEach((e) => (e.visible = fin || (o.oldWindows && solid > 0)));
      crane.visible = (o.crane || []).includes(stage);
      scaf.visible = (o.scaf || []).includes(stage);
      const lit = stage >= o.litFrom ? Math.round(frac * wins.length) : 0;
      wins.forEach((w, i) => {
        w.group.forEach((g) => (g.visible = fin || (o.oldWindows && solid > 0)));
        const on = i < lit;
        w.m.emissive.setHex(on ? 0xffc46b : 0);
        w.m.emissiveIntensity = on ? 1.4 : 0;
        w.m.color.setHex(on ? 0xffe2ad : 0x1a2740);
      });
    },
  };
}

function solar(sc, G) {
  box(sc, 30, 0.1, 22, std(0x24331f, { roughness: 1 }), 0, 0.05, 0);
  const pm = std(0x2450b0, { roughness: 0.3, metalness: 0.4, emissive: 0x2a6cff, emissiveIntensity: 0 });
  const leg = std(0x777d88);
  const panels = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 8; c++) {
      const x = -12.3 + c * 3.1, z = -8 + r * 3;
      const p = box(sc, 2.8, 0.1, 1.9, pm, x, 1.25, z);
      p.rotation.x = -0.5;
      const l = box(sc, 0.12, 1.1, 0.12, leg, x, 0.55, z);
      panels.push({ p, l });
    }
  const bm = std(0xeef1f4, { roughness: 0.5 });
  const bats = [box(sc, 4.4, 2.1, 1.9, bm, 13.5, 1.05, -6), box(sc, 4.4, 2.1, 1.9, bm, 13.5, 1.05, -3)];
  const led = std(0x4fd39a, { emissive: 0x4fd39a, emissiveIntensity: 1.5 });
  const leds = [0, 1, 2, 3, 4, 5].map((i) => box(sc, 0.5, 0.25, 0.06, led, 11.9 + (i % 3) * 0.7, 1.6, i < 3 ? -5.02 : -2.02));
  const pyl = [box(sc, 0.3, 7, 0.3, leg, 13.5, 3.5, 4), box(sc, 3, 0.2, 0.2, leg, 13.5, 6.6, 4)];
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 24), new THREE.MeshBasicMaterial({ color: 0xffd76a }));
  sun.position.set(-14, 15, -12);
  sc.add(sun);
  trees(sc, [[-16, 10], [16, 10], [-17, -9], [9, 12]]);
  let on = false;
  return {
    target: [0, 1.5, 0],
    cam: [20, 13, 25],
    tick: (t) => {
      pm.emissiveIntensity = on ? 0.35 + Math.sin(t * 2) * 0.15 : 0;
      sun.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06);
    },
    update: (stage, frac) => {
      const solid = [0, 24, 48, 48][stage];
      panels.forEach((o, i) => {
        o.p.material = i < solid ? pm : G;
        o.l.visible = i < solid;
      });
      bats.forEach((b) => (b.visible = stage >= 2));
      pyl.forEach((b) => (b.visible = stage >= 2));
      on = stage >= 3;
      sun.visible = on;
      leds.forEach((l, i) => (l.visible = on && i < Math.max(1, Math.round(frac * 6))));
    },
  };
}

function warehouse(sc, G) {
  box(sc, 32, 0.1, 24, std(0x1c2639, { roughness: 0.9 }), 0, 0.05, 0);
  const wall = std(0xdfe3ea, { roughness: 0.6 }), roofM = std(0x3a4660, { metalness: 0.4, roughness: 0.5 });
  const body = box(sc, 22, 5.5, 11, G, 0, 2.75, -2);
  body.geometry = new THREE.BoxGeometry(22, 5.5, 11, 8, 2, 4);
  const roof = box(sc, 22.6, 0.4, 11.6, roofM, 0, 5.7, -2);
  const stripe = box(sc, 22.05, 0.7, 11.05, std(0xd8b36a, { metalness: 0.5, roughness: 0.4 }), 0, 4.6, -2);
  const docks = [];
  for (let i = 0; i < 8; i++) {
    const m = std(0x4a5266, { roughness: 0.5 });
    docks.push({ m, mesh: box(sc, 1.9, 2.4, 0.15, m, -9.1 + i * 2.6, 1.3, 3.55) });
  }
  const tm = std(0xf2f2f2), cab = std(0xc23b3b), wh = std(0x111111);
  const trucks = [-6.5, 3.9].map((x) => {
    const g = new THREE.Group();
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 5.5), tm);
    a.position.set(0, 1.75, 0);
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.7, 1.5), cab);
    b.position.set(0, 1.35, 3.6);
    g.add(a, b);
    [-1.5, 1.6, 3.6].forEach((z) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.8, 0.8), wh);
      w.position.set(0, 0.4, z);
      g.add(w);
    });
    g.position.set(x, 0, 7);
    g.traverse((o) => (o.castShadow = true));
    sc.add(g);
    return g;
  });
  trees(sc, [[-14, 9], [14, 9], [-15, -8], [15, -8]]);
  return {
    target: [0, 2.5, 0],
    cam: [21, 13, 27],
    tick: (t) => trucks.forEach((g, i) => (g.position.z = 7 + Math.max(0, Math.sin(t * 0.5 + i * 2)) * 3)),
    update: (stage, frac) => {
      const solid = stage >= 1;
      body.material = solid ? wall : G;
      [roof, stripe].forEach((m) => (m.visible = solid));
      const lit = stage >= 2 ? Math.max(5, Math.round(5 + frac * 3)) : 0;
      docks.forEach((d, i) => {
        d.mesh.visible = solid;
        d.m.emissive.setHex(i < lit ? 0x4fd39a : 0);
        d.m.emissiveIntensity = i < lit ? 0.9 : 0;
      });
      trucks.forEach((g) => (g.visible = stage >= 2));
    },
  };
}

function farm(sc, G) {
  box(sc, 34, 0.1, 26, std(0x3b2f1e, { roughness: 1 }), 0, 0.05, 0);
  const lav = std(0x8b6fd6, { roughness: 0.9, emissive: 0x3a2a7a, emissiveIntensity: 0.25 }), wheat = std(0xd9b24c, { roughness: 0.9 });
  const rows = [];
  for (let i = 0; i < 11; i++) rows.push({ m: box(sc, 13, 0.7, 0.9, G, -8.5, 0.4, -10 + i * 2), mat: lav });
  for (let i = 0; i < 11; i++) rows.push({ m: box(sc, 13, 0.5, 1.5, G, 7, 0.3, -10 + i * 2), mat: wheat });
  const barn = [box(sc, 5, 3.4, 4, std(0xa63a2e), 13.5, 1.7, 9.5)];
  const rf = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 3.6, 2, 4), std(0x4a3524));
  rf.position.set(13.5, 4.4, 9.5);
  rf.rotation.y = Math.PI / 4;
  rf.scale.set(1, 1, 0.82);
  sc.add(rf);
  barn.push(rf);
  const bm = std(0xe2c36b);
  const bales = Array.from({ length: 12 }, (_, i) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.1, 14), bm);
    b.rotation.z = Math.PI / 2;
    b.position.set(1 + (i % 6) * 2.2, 0.75, 11.2 - Math.floor(i / 6) * 1.6);
    b.castShadow = true;
    sc.add(b);
    return b;
  });
  const tr = new THREE.Group();
  const tb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 2.2), std(0x2f8f4a));
  tb.position.y = 1;
  const tc = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1, 1), std(0x9fd0ff, { roughness: 0.2 }));
  tc.position.set(0, 1.9, -0.5);
  tr.add(tb, tc);
  [[-0.7, -0.6], [0.7, -0.6], [-0.7, 0.7], [0.7, 0.7]].forEach(([x, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12), std(0x111111));
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.5, z);
    tr.add(w);
  });
  sc.add(tr);
  trees(sc, [[-16, 12], [16, -12], [-17, -11], [9, 12.5]]);
  return {
    target: [0, 1, 0],
    cam: [22, 14, 27],
    tick: (t) => tr.position.set(-0.8, 0, Math.sin(t * 0.35) * 10),
    update: (stage, frac) => {
      rows.forEach((r) => (r.m.material = stage >= 1 ? r.mat : G));
      barn.forEach((b) => (b.visible = stage >= 1));
      tr.visible = stage >= 2;
      const n = stage >= 2 ? Math.max(2, Math.round(frac * 12)) : 0;
      bales.forEach((b, i) => (b.visible = i < n));
    },
  };
}

const BUILD = {
  newbuild: (sc, G) => tower(sc, G, { floors: 6, per: 5, W: 15, D: 8, solid: [0, 2, 6, 6, 6, 6], finFrom: 3, crane: [1, 2], litFrom: 5 }),
  flip: (sc, G) => tower(sc, G, { floors: 3, per: 3, W: 11, D: 8, raw: 0x8d7a66, fin: 0xf3efe6, solid: [0, 3, 3, 3], finFrom: 3, scaf: [2], litFrom: 3, oldWindows: true }),
  hotel: (sc, G) => tower(sc, G, { floors: 4, per: 7, W: 19, D: 7, fin: 0xf7f4ee, slabC: 0x2a6f8f, solid: [0, 4, 4], finFrom: 2, scaf: [1], litFrom: 2, pool: true, oldWindows: true, trees: [[-13, 8], [-14, -6], [13, -7], [-9, 12]] }),
  solar,
  warehouse,
  farm,
};

export default function Scene3D({ type = 'newbuild', stage = 0, frac = 0, height = 520 }) {
  const el = useRef(null);
  const R = useRef(null);
  const st = useRef({ stage, frac });
  st.current = { stage, frac };

  useEffect(() => {
    const box0 = el.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0e17, 45, 110);
    const cam = new THREE.PerspectiveCamera(38, box0.clientWidth / box0.clientHeight, 0.1, 250);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(box0.clientWidth, box0.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    box0.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x1a1408, 0.8));
    const sun = new THREE.DirectionalLight(0xffe2b0, 1.6);
    sun.position.set(18, 28, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28 });
    scene.add(sun);
    const rim = new THREE.PointLight(0xd8b36a, 60, 60);
    rim.position.set(-16, 10, -12);
    scene.add(rim);
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 0.6, 64), std(0x121a2a, { roughness: 0.95 }));
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(28, 0.06, 8, 120), new THREE.MeshBasicMaterial({ color: 0xd8b36a }));
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    const G = new THREE.MeshBasicMaterial({ color: 0xd8b36a, wireframe: true, transparent: true, opacity: 0.28 });
    const b = (BUILD[type] || BUILD.newbuild)(scene, G);
    cam.position.set(...b.cam);
    const ctl = new OrbitControls(cam, renderer.domElement);
    ctl.target.set(...b.target);
    ctl.enableDamping = true;
    ctl.autoRotate = true;
    ctl.autoRotateSpeed = 0.7;
    ctl.enablePan = false;
    ctl.minDistance = 16;
    ctl.maxDistance = 60;
    ctl.maxPolarAngle = Math.PI / 2.08;
    b.update(st.current.stage, st.current.frac);
    R.current = b;

    let raf;
    const t0 = performance.now();
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      G.opacity = 0.22 + Math.sin(t * 2) * 0.07;
      b.tick && b.tick(t);
      ctl.update();
      renderer.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();
    const onR = () => {
      cam.aspect = box0.clientWidth / box0.clientHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(box0.clientWidth, box0.clientHeight);
    };
    window.addEventListener('resize', onR);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onR);
      ctl.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      box0.removeChild(renderer.domElement);
      R.current = null;
    };
  }, [type]);

  useEffect(() => {
    R.current && R.current.update(stage, frac);
  }, [stage, frac, type]);

  return <div ref={el} className="b3d" style={{ height }} />;
}
