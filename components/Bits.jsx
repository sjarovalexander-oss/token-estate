'use client';
import { useEffect, useRef, useState } from 'react';
import { eur, last } from '../lib/data';

// Секция, която се появява плавно при скролване
export function Reveal({ children, className = '', as: Tag = 'section', ...rest }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.08 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={className + ' reveal' + (on ? ' in' : '')} {...rest}>{children}</Tag>;
}

// Число, което брои до стойността си
export function Count({ to, fmt = (n) => Math.round(n) }) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const a = from.current, t0 = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
      setV(a + (to - a) * e);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{fmt(v)}</>;
}

// Натрупани плащания за един токен във времето
export function PayoutChart({ p, ps }) {
  const W = 640, H = 220, pad = 40;
  const startM = p.stages[last(p)].month;
  const pts = [[0, 0]];
  let total;
  if (p.type === 'exit') {
    total = p.payout;
    pts.push([startM, 0]);
    for (let i = 1; i <= p.N; i++) pts.push([startM + (i / p.N) * Math.max(3, p.months * 0.2), (p.payout * i) / p.N]);
  } else {
    total = p.price * (1 + p.yld * p.years);
    pts.push([startM, 0]);
    for (let i = 1; i <= p.N; i++) pts.push([startM + i * 3, (p.price * p.yld * i) / 4 + (i === p.N ? p.price : 0)]);
  }
  const maxM = pts[pts.length - 1][0];
  const x = (m) => pad + (m / maxM) * (W - pad * 2);
  const y = (v) => H - pad - (v / total) * (H - pad * 2);
  const line = (a) => a.map((q, i) => (i ? 'L' : 'M') + x(q[0]).toFixed(1) + ' ' + y(q[1]).toFixed(1)).join(' ');
  const done = ps.stage === last(p) ? ps.prog : 0;
  const past = pts.slice(0, 2 + done);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      {[0, 0.5, 1].map((k) => (
        <g key={k}>
          <line x1={pad} x2={W - pad} y1={y(total * k)} y2={y(total * k)} className="gl" />
          <text x={2} y={y(total * k) + 4}>{Math.round(total * k)}</text>
        </g>
      ))}
      <line x1={pad} x2={W - pad} y1={y(p.price)} y2={y(p.price)} className="inv" />
      <text x={pad + 6} y={y(p.price) - 6}>вложени {eur(p.price)}</text>
      <path d={line(pts) + ` L${x(maxM)} ${y(0)} L${x(0)} ${y(0)} Z`} className="area" />
      <path d={line(pts)} className="fut" />
      {done > 0 && <path d={line(past)} className="past" />}
      <circle cx={x(pts[pts.length - 1][0])} cy={y(total)} r="5" className="pd" />
      <text x={pad} y={H - 12}>месец 0</text>
      <text x={W - pad} y={H - 12} textAnchor="end">месец {Math.round(maxM)}</text>
    </svg>
  );
}

export function Donut({ parts, size = 190 }) {
  const tot = parts.reduce((a, p) => a + p.v, 0) || 1;
  const r = 70, c = 2 * Math.PI * r;
  let off = 0;
  const cols = ['#d8b36a', '#6aa8ff', '#4fd39a', '#b08cff', '#ff9f6a', '#5fd0e0', '#e06aa8'];
  return (
    <div className="donut">
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <circle cx="100" cy="100" r={r} fill="none" stroke="#1a2238" strokeWidth="26" />
        {parts.map((p, i) => {
          const len = (p.v / tot) * c;
          const el = <circle key={p.k} cx="100" cy="100" r={r} fill="none" stroke={cols[i % cols.length]} strokeWidth="26" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 100 100)" style={{ transition: 'all .6s' }} />;
          off += len;
          return el;
        })}
      </svg>
      <ul>
        {parts.map((p, i) => (
          <li key={p.k}><i style={{ background: cols[i % cols.length] }} />{p.k}<b>{Math.round((p.v / tot) * 100)}%</b></li>
        ))}
      </ul>
    </div>
  );
}
