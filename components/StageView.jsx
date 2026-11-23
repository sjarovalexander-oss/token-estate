'use client';
import { useEffect, useState } from 'react';
import { STILLS, still } from '../lib/data';

// Фотореалистичен изглед на проекта: кадърът на текущия етап, с плавна смяна.
// p = проект (cat, frames, stages); stage = текущ етап; auto = върти кадрите сам (за страницата на секцията)
export default function StageView({ p, stage = 0, auto = false, height = 520, badge, children }) {
  const n = STILLS[p.cat] || 1;
  const frames = p.frames || Array.from({ length: p.stages.length }, (_, i) => Math.min(i, n - 1));
  const [peek, setPeek] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setTick((x) => x + 1), 3200);
    return () => clearInterval(t);
  }, [auto]);
  const st = auto ? tick % p.stages.length : peek ?? stage;
  const cur = frames[st];
  const used = [...new Set(frames)];
  return (
    <div className="stageview" style={{ height }}>
      {used.map((f) => (
        <img key={f} src={still(p.cat, f)} alt="" className={f === cur ? 'on' : ''} loading={f === cur ? 'eager' : 'lazy'} />
      ))}
      <div className="sv-shade" />
      <div className="sv-top">
        <span className="sv-chip">
          <i /> {auto ? 'Етапите на проекта' : peek !== null ? 'Преглед на етап' : 'Сега'} · {p.stages[st].k}
        </span>
        {badge}
      </div>
      <div className="sv-strip">
        {p.stages.map((s, i) => (
          <button
            key={s.k}
            className={(i === st ? 'cur ' : '') + (!auto && i <= stage ? 'done' : '')}
            onMouseEnter={() => !auto && setPeek(i)}
            onMouseLeave={() => !auto && setPeek(null)}
            onClick={() => (auto ? setTick(i) : setPeek(peek === i ? null : i))}
            title={s.k}
          >
            <img src={still(p.cat, frames[i])} alt="" loading="lazy" />
            <span>{s.short}</span>
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
