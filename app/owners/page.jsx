'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../providers';
import { CATS, PROJECTS, FEE, eur } from '../../lib/data';

export default function Owners() {
  const { addApp } = useStore();
  const [f, setF] = useState({ company: '', cat: 'stroitelstvo', name: '', loc: '', amount: 800000, price: 1000, ret: 20, term: 24 });
  const [sent, setSent] = useState(false);
  const base = PROJECTS.find((p) => p.cat === f.cat);
  const exit = base.type === 'exit';
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('cat');
    if (q && CATS.some((c) => c.slug === q)) pick(q);
  }, []);
  function pick(cat) {
    const b = PROJECTS.find((p) => p.cat === cat);
    const ex = b.type === 'exit';
    setF((x) => ({ ...x, cat, price: b.price, ret: ex ? Math.round((b.payout / b.price - 1) * 100) : b.yld * 100, term: ex ? b.months : b.years }));
  }

  const fee = f.amount * FEE.raise;
  const years = exit ? f.term / 12 : f.term;
  const cost = exit ? (f.amount * f.ret) / 100 : (f.amount * f.ret * f.term) / 100;
  const ok = f.company.trim() && f.name.trim() && f.loc.trim() && f.amount >= 100000 && f.amount <= 5000000;

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">За строители, оператори и собственици на активи</div>
          <h1>Финансирай проекта си чрез токени</h1>
          <p className="muted">Набери до 5 000 000 € от много инвеститори, без да даваш дял от фирмата си и без да чакаш банка.</p>
        </div>
      </section>

      <section className="kpis">
        {[['1', 'Подаваш заявка', 'Описваш проекта, сумата и доходността, която предлагаш.'], ['2', 'Проверка', 'Документи, бюджет, оценка и обезпечение. Обикновено 3–6 седмици.'], ['3', 'Набиране', 'Проектът се обявява с 3D модел и се продава на токени.'], ['4', 'Получаваш парите', 'На траншове от ескроу сметка, след всеки достигнат етап.']].map(([n, t, d]) => (
          <div key={n} className="card step"><b>{n}</b><h3>{t}</h3><p className="muted small">{d}</p></div>
        ))}
      </section>

      <section className="two">
        <div className="card">
          <h3>Заявка за финансиране</h3>
          {sent ? (
            <div className="center-txt">
              <div className="okmark">✓</div>
              <h3>Заявката е изпратена</h3>
              <p className="muted">В демото можеш веднага да я одобриш от админ панела и проектът ще се появи в каталога.</p>
              <div className="row end center">
                <button className="btn ghost" onClick={() => setSent(false)}>Нова заявка</button>
                <Link className="btn sm" href="/admin#apps">Към админ панела</Link>
              </div>
            </div>
          ) : (
            <>
              <label>Секция</label>
              <div className="chips">
                {CATS.map((c) => (
                  <button key={c.slug} className={f.cat === c.slug ? 'on' : ''} onClick={() => pick(c.slug)}>{c.icon} {c.name}</button>
                ))}
              </div>
              <div className="form2">
                <div><label>Фирма</label><input type="text" value={f.company} onChange={(e) => set('company', e.target.value)} placeholder="„Примерна фирма“ ООД" /></div>
                <div><label>Име на проекта</label><input type="text" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Напр. Сграда „Изгрев“" /></div>
                <div><label>Местоположение</label><input type="text" value={f.loc} onChange={(e) => set('loc', e.target.value)} placeholder="Град, квартал" /></div>
                <div>
                  <label>Цена на един токен</label>
                  <select value={f.price} onChange={(e) => set('price', +e.target.value)}>
                    {[500, 1000, 2500, 5000].map((v) => <option key={v} value={v}>{eur(v)}</option>)}
                  </select>
                </div>
              </div>
              <label>Търсена сума: <b>{eur(f.amount)}</b></label>
              <input type="range" min="100000" max="5000000" step="50000" value={f.amount} onChange={(e) => set('amount', +e.target.value)} />
              <label>Доходност за инвеститорите: <b>{f.ret}%</b> {exit ? 'за целия срок' : 'годишно'}</label>
              <input type="range" min="3" max="30" step="0.5" value={f.ret} onChange={(e) => set('ret', +e.target.value)} />
              <label>Срок: <b>{f.term} {exit ? 'месеца' : 'години'}</b></label>
              <input type="range" min={exit ? 6 : 3} max={exit ? 36 : 10} value={f.term} onChange={(e) => set('term', +e.target.value)} />
              <button className="btn" disabled={!ok} onClick={() => { addApp(f); setSent(true); }}>Изпрати заявката</button>
              {!ok && <p className="muted small">Попълни фирма, име и местоположение.</p>}
            </>
          )}
        </div>
        <div className="card">
          <h3>Колко ще ти струва</h3>
          <table className="tbl">
            <tbody>
              <tr><td>Търсена сума</td><td>{eur(f.amount)}</td></tr>
              <tr><td>Брой токени</td><td>{Math.round(f.amount / f.price)} × {eur(f.price)}</td></tr>
              <tr><td>Такса на платформата (4%, само при успех)</td><td>−{eur(fee)}</td></tr>
              <tr className="hl"><td>Получаваш за проекта</td><td>{eur(f.amount - fee)}</td></tr>
              <tr><td>Доход за инвеститорите за целия срок</td><td>{eur(cost)}</td></tr>
              <tr><td>Връщаш общо</td><td>{eur(f.amount + cost)}</td></tr>
              <tr><td>Обща цена на финансирането на година</td><td>{(((cost + fee) / f.amount / years) * 100).toFixed(1)}%</td></tr>
            </tbody>
          </table>
          <p className="muted small">
            {exit ? 'Плюс 10% от печалбата на проекта за платформата при успешна продажба.' : 'Плюс 1% годишна такса за управление към платформата.'} Таксите са примерен модел за демото.
          </p>
          <h3 style={{ marginTop: 20 }}>Какво трябва да имаш</h3>
          <ul className="checks">
            <li>Документи за собственост и нужните разрешения.</li>
            <li>Собствено участие в проекта, обикновено поне 20–30%.</li>
            <li>Подробен бюджет и готовност за независима оценка.</li>
            <li>Съгласие активът да е в отделно дружество с обезпечение за инвеститорите.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
