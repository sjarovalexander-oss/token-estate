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
