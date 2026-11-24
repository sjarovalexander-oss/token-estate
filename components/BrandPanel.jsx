'use client';
import { useEffect, useState } from 'react';
import { BRAND, usePrefs, setPrefs } from '../lib/brand';

// Бутон „Твоето име“: партньорът вижда платформата със своето име
export default function BrandPanel() {
  const pr = usePrefs();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  useEffect(() => setName(pr.name), [pr.name]);
  const en = pr.lang === 'en';
  return (
    <div className="bp">
      <button className="bp-btn" onClick={() => setOpen((o) => !o)}>
        <i style={{ background: 'var(--gold)' }} /> {en ? 'Your name' : 'Твоето име'}
      </button>
      {open && (
        <div className="bp-pop card">
          <b>{en ? 'Your brand' : 'Твоята марка'}</b>
          <p className="muted small">{en ? 'See the platform under your own name. Saved only in this browser.' : 'Виж платформата със своето име. Пази се само в този браузър.'}</p>
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
            <button className="btn ghost sm" onClick={() => setPrefs({ name: BRAND.name })}>{en ? 'Reset' : 'По подразбиране'}</button>
            <button className="btn sm" onClick={() => setOpen(false)}>{en ? 'Done' : 'Готово'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
