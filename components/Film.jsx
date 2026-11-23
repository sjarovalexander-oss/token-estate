'use client';
import { useEffect, useRef, useState } from 'react';

// Видео на цял екран, което се превърта със скролването
export function Film({ name, height = '210vh', children }) {
  const wrap = useRef(null), vid = useRef(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    let raf, cur = 0;
    const loop = () => {
      const w = wrap.current, v = vid.current;
      if (w) {
        const r = w.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
        w.style.setProperty('--p', p.toFixed(4));
        if (v && v.duration && r.bottom > 0) {
          cur += (p * (v.duration - 0.08) - cur) * 0.16;
          if (Math.abs(v.currentTime - cur) > 0.02) v.currentTime = cur;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <section ref={wrap} className={'film' + (ok ? '' : ' novid')} style={{ height }}>
      <div className="film-sticky">
        {ok && <video ref={vid} src={`/video/${name}.mp4`} poster={`/video/${name}.jpg`} muted playsInline preload="auto" onError={() => setOk(false)} />}
        <div className="film-shade" />
        <div className="film-txt">{children}</div>
        <div className="film-hint">скролни надолу<i /></div>
      </div>
    </section>
  );
}

// Видео фон, което върви само докато се вижда
export function LoopVideo({ name, className = '' }) {
  const ref = useRef(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, [ok]);
  if (!ok) return null;
  return <video ref={ref} className={'loopvid ' + className} src={`/video/${name}.mp4`} poster={`/video/${name}.jpg`} muted loop playsInline preload="none" onError={() => setOk(false)} />;
}

// Скрол филм на глави: една сцена, която се преобразява, с номер и текст за всяка глава
export function Story({ name, chapters, label }) {
  const wrap = useRef(null), vid = useRef(null), els = useRef([]), fill = useRef(null);
  const [ok, setOk] = useState(true);
  const [act, setAct] = useState(0);
  const n = chapters.length;
  useEffect(() => {
    let raf, cur = 0, last = -1;
    const loop = () => {
      const w = wrap.current, v = vid.current;
      if (w) {
        const r = w.getBoundingClientRect();
        if (r.bottom > -200 && r.top < window.innerHeight + 200) {
          const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
          const x = p * (n - 1);
          const i = Math.min(n - 2, Math.floor(x)), f = x - i, e = f * f * (3 - 2 * f);
          if (v && v.duration) {
            cur += (((i + e) / (n - 1)) * (v.duration - 0.08) - cur) * 0.16;
            if (Math.abs(v.currentTime - cur) > 0.02) v.currentTime = cur;
          }
          els.current.forEach((el, k) => {
            if (!el) return;
            const d = Math.abs(x - k), o = Math.max(0, 1 - d * 2.4);
            el.style.opacity = o;
            el.style.transform = `translateY(${(x - k) * -60}px)`;
            el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
          });
          if (fill.current) fill.current.style.width = p * 100 + '%';
          const a = Math.round(x);
          if (a !== last) { last = a; setAct(a); }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [n]);
  return (
    <section ref={wrap} className={'film story' + (ok ? '' : ' novid')} style={{ height: n * 105 + 'vh' }}>
      <div className="film-sticky">
        {ok && <video ref={vid} src={`/video/${name}.mp4`} muted playsInline preload="auto" onError={() => setOk(false)} />}
        <div className="story-shade" />
        {label && <div className="story-label">{label}</div>}
        {chapters.map((c, k) => (
          <div key={c.t} ref={(el) => (els.current[k] = el)} className={'chap ' + (k % 2 ? 'right' : 'left')}>
            <span className="num">{String(k + 1).padStart(2, '0')}</span>
            <div className="chap-txt">
              <em>{c.tag}</em>
              <h2>{c.t}</h2>
              <p>{c.d}</p>
            </div>
          </div>
        ))}
        <div className="rail">
          <div className="rail-line"><i ref={fill} /></div>
          <div className="rail-ticks">
            {chapters.map((c, k) => (
              <span key={c.t} className={k <= act ? 'on' : ''}><b>{String(k + 1).padStart(2, '0')}</b>{c.t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
