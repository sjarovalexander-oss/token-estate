'use client';
import { useEffect, useState } from 'react';
import { THEMES, BRAND, usePrefs, setPrefs, applyTheme } from '../lib/brand';

// Бутон „Тема“: партньорът вижда платформата със своите цветове и име
export default function BrandPanel() {
  const pr = usePrefs();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  useEffect(() => applyTheme(pr.theme), [pr.theme]);
  useEffect(() => setName(pr.name), [pr.name]);
  const en = pr.lang === 'en';
  return (
    <div className="bp">
      <button className="bp-btn" onClick={() => setOpen((o) => !o)} aria-label="Theme">
        <i style={{ background: 'var(--gold)' }} /> {en ? 'Theme' : 'Тема'}
      </button>
      {open && (
        <div className="bp-pop card">
          <b>{en ? 'Your brand' : 'Твоята марка'}</b>
          <p className="muted small">{en ? 'See the platform with your colours and name. Saved only in this browser.' : 'Виж платформата със своите цветове и име. Пази се само в този браузър.'}</p>
          <div className="bp-sw">
            {THEMES.map((t) => (
              <button key={t.id} className={pr.theme === t.id ? 'on' : ''} onClick={() => setPrefs({ theme: t.id })}>
                <i style={{ background: `linear-gradient(135deg, ${t.v['--gold2']}, ${t.v['--gold']} 55%, ${t.v['--panel']})` }} />
                {en ? t.en : t.bg}
              </button>
            ))}
          </div>
          <label className="small muted">{en ? 'Platform name' : 'Име на платформата'}</label>
          <input
            value={name}
            maxLength={28}
            onChange={(e) => {
              setName(e.target.value);
              setPrefs({ name: e.target.value.trim() || BRAND.name });
            }}
          />
          <div className="row end">
            <button className="btn ghost sm" onClick={() => { setPrefs({ name: BRAND.name, theme: 'gold' }); }}>{en ? 'Reset' : 'По подразбиране'}</button>
            <button className="btn sm" onClick={() => setOpen(false)}>{en ? 'Done' : 'Готово'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
