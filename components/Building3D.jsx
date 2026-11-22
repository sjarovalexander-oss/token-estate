'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const FLOORS = 6;
const PER = 5;
const SOLID = [0, 2, 6, 6, 6, 6];

export default function Building3D({ stage = 0, aptsSold = 0, height = 520 }) {
  const box = useRef(null);
  const R = useRef(null);

  useEffect(() => {
    const el = box.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0e17, 38, 90);
    const cam = new THREE.PerspectiveCamera(38, el.clientWidth / el.clientHeight, 0.1, 200);
    cam.position.set(22, 15, 27);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const ctl = new OrbitControls(cam, renderer.domElement);
    ctl.target.set(0, 7, 0);
    ctl.enableDamping = true;
    ctl.autoRotate = true;
    ctl.autoRotateSpeed = 0.7;
    ctl.enablePan = false;
    ctl.minDistance = 18;
    ctl.maxDistance = 55;
    ctl.maxPolarAngle = Math.PI / 2.08;

    scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x1a1408, 0.75));
    const sun = new THREE.DirectionalLight(0xffe2b0, 1.6);
    sun.position.set(18, 28, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25 });
    scene.add(sun);
    const rim = new THREE.PointLight(0xd8b36a, 60, 60);
    rim.position.set(-16, 10, -12);
    scene.add(rim);

    // терен
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(26, 26, 0.6, 64),
      new THREE.MeshStandardMaterial({ color: 0x121a2a, roughness: 0.95 })
    );
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(26, 0.06, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0xd8b36a })
    );
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    const plot = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.12, 15),
      new THREE.MeshStandardMaterial({ color: 0x1c2639, roughness: 0.9 })
    );
    plot.position.y = 0.06;
    plot.receiveShadow = true;
    scene.add(plot);

    const mats = {
      ghost: new THREE.MeshBasicMaterial({ color: 0xd8b36a, wireframe: true, transparent: true, opacity: 0.28 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0x8a8f99, roughness: 0.95 }),
      facade: new THREE.MeshStandardMaterial({ color: 0xece6da, roughness: 0.7 }),
      slab: new THREE.MeshStandardMaterial({ color: 0x3a3f4b, roughness: 0.8 }),
    };
    const W = 15, D = 8, H = 2.3;
    const floors = [];
    const wins = [];
    const extras = [];
    for (let f = 0; f < FLOORS; f++) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(W, H - 0.25, D, 5, 1, 3), mats.ghost);
      body.position.y = f * H + H / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      scene.add(body);
      const slab = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.25, D + 0.6), mats.slab);
      slab.position.y = (f + 1) * H - 0.12;
      slab.castShadow = true;
      scene.add(slab);
      floors.push({ body, slab });
      for (let i = 0; i < PER; i++) {
        const m = new THREE.MeshStandardMaterial({
          color: 0x1a2740, roughness: 0.15, metalness: 0.6, emissive: 0x000000,
        });
        const x = -W / 2 + (W / PER) * (i + 0.5);
        const y = f * H + H / 2;
        const group = [];
        [1, -1].forEach((side) => {
          const w = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.35, 0.08), m);
          w.position.set(x, y, side * (D / 2 + 0.03));
          scene.add(w);
          group.push(w);
          const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.7), mats.slab);
          b.position.set(x, y - 0.75, side * (D / 2 + 0.36));
          b.castShadow = true;
          scene.add(b);
          extras.push(b);
        });
        wins.push({ m, group });
      }
    }
    // покрив и вход
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 4), mats.facade);
    roof.position.y = FLOORS * H + 0.6;
    scene.add(roof);
    extras.push(roof);
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xd8b36a, metalness: 0.7, roughness: 0.3 })
    );
    door.position.set(0, 0.95, D / 2 + 0.3);
    scene.add(door);
    extras.push(door);

    // дървета
    const trunkM = new THREE.MeshStandardMaterial({ color: 0x4a3524 });
    const leafM = new THREE.MeshStandardMaterial({ color: 0x2f6b4a, roughness: 0.9 });
    [[-13, 9], [-9, 11], [12, 10], [15, 6], [-15, -6], [13, -9], [6, 12]].forEach(([x, z]) => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.4), trunkM);
      t.position.set(x, 0.7, z);
      const l = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + Math.random() * 0.4, 1), leafM);
      l.position.set(x, 2.1, z);
      l.castShadow = true;
      scene.add(t, l);
    });

    // кран
    const crane = new THREE.Group();
    const cm = new THREE.MeshStandardMaterial({ color: 0xe0a82e, roughness: 0.5 });
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.5, 20, 0.5), cm);
    mast.position.y = 10;
    const jib = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 0.4), cm);
    jib.position.set(4.5, 19.5, 0);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 5), mats.slab);
    cable.position.set(10, 17, 0);
    const hook = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.2), mats.concrete);
    hook.position.set(10, 14.4, 0);
    crane.add(mast, jib, cable, hook);
    crane.position.set(-10.5, 0, -6);
    scene.add(crane);

    R.current = { floors, wins, extras, crane, mats };

    let raf;
    const t0 = performance.now();
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      crane.rotation.y = Math.sin(t * 0.3) * 0.5;
      mats.ghost.opacity = 0.22 + Math.sin(t * 2) * 0.07;
      ctl.update();
      renderer.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();
    const onR = () => {
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onR);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onR);
      ctl.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
      R.current = null;
    };
  }, []);

  useEffect(() => {
    const r = R.current;
    if (!r) return;
    const solid = SOLID[stage];
    const finished = stage >= 3;
    r.floors.forEach((f, i) => {
      f.body.material = i < solid ? (finished ? r.mats.facade : r.mats.concrete) : r.mats.ghost;
      f.slab.visible = i < solid;
    });
    r.extras.forEach((e) => (e.visible = finished));
    r.crane.visible = stage === 1 || stage === 2;
    r.wins.forEach((w, i) => {
      w.group.forEach((g) => (g.visible = finished));
      const lit = stage >= 5 && i < aptsSold;
      w.m.emissive.setHex(lit ? 0xffc46b : 0x000000);
      w.m.emissiveIntensity = lit ? 1.4 : 0;
      w.m.color.setHex(lit ? 0xffe2ad : 0x1a2740);
    });
  }, [stage, aptsSold]);

  return <div ref={box} className="b3d" style={{ height }} />;
}
