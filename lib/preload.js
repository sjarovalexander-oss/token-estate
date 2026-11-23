'use client';
// Тегли филмите на заден план още при отваряне на сайта и ги пази в паметта,
// за да тръгват веднага, когато се отвори секцията.
import { useEffect, useState } from 'react';

const st = { src: {}, prog: {}, queue: [], loading: new Set(), subs: new Set() };
const emit = () => st.subs.forEach((f) => f());

async function load(name) {
  if (st.src[name] || st.loading.has(name)) return;
  st.loading.add(name);
  try {
    const r = await fetch(`/video/${name}.mp4`);
    if (!r.ok || !r.body) throw new Error('no video');
    const total = +r.headers.get('content-length') || 0;
    const reader = r.body.getReader();
    const chunks = [];
    let got = 0, last = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.length;
      const p = total ? got / total : 0;
      if (p - last > 0.02) { last = p; st.prog[name] = p; emit(); }
    }
    st.src[name] = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
    st.prog[name] = 1;
  } catch (e) {
    st.prog[name] = -1; // няма да се зареди предварително; видеото ще се стриймва директно
  }
  st.loading.delete(name);
  emit();
  pump();
}
function pump() {
  if (st.loading.size) return;
  const n = st.queue.shift();
  if (n) load(n);
}
export function startPreload(names) {
  if (typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData) return;
  names.forEach((n) => { if (!st.src[n] && !st.loading.has(n) && !st.queue.includes(n)) st.queue.push(n); });
  pump();
}
// Този филм е нужен сега: тегли се веднага, без да чака реда си
export function prioritize(name) {
  st.queue = st.queue.filter((x) => x !== name);
  load(name);
}
export function useVideo(name, urgent) {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    st.subs.add(f);
    if (urgent) prioritize(name);
    return () => st.subs.delete(f);
  }, [name, urgent]);
  const p = st.prog[name] || 0;
  return { src: st.src[name] || null, failed: p === -1, pct: Math.round(Math.max(0, p) * 100) };
}
export function usePreloadStatus(names) {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    st.subs.add(f);
    return () => st.subs.delete(f);
  }, []);
  return { done: names.filter((n) => st.src[n]).length, total: names.length, active: st.loading.size > 0 || st.queue.length > 0 };
}
