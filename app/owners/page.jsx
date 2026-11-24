'use client';
import { EnNote } from '../../lib/brand';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../providers';
import { CATS, PROJECTS, FEE, STILLS, still, thumb, eur } from '../../lib/data';

const STEPS = [
  ['Подаваш заявка', 'Описваш проекта, сумата и доходността, която предлагаш.', 0],
  ['Проверка', 'Документи, бюджет, независима оценка и обезпечение. Обикновено 3–6 седмици.', 1],
  ['Набиране', 'Проектът се обявява с филм и снимки и се продава на токени.', 2],
  ['Получаваш парите', 'На траншове от ескроу сметка, след всеки достигнат етап.', 3],
];

export default function Owners() {
  const { addApp } = useStore();
  const [f, setF] = useState({ company: '', cat: 'stroitelstvo', name: '', loc: '', amount: 800000, price: 1000, ret: 20, term: 24 });
  const [sent, setSent] = useState(false);
  const base = PROJECTS.find((p) => p.cat === f.cat);
  const exit = base.type === 'exit';
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const c = CATS.find((x) => x.slug === f.cat);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('cat');
    if (q && CATS.some((x) => x.slug === q)) pick(q);
  }, []);
  function pick(cat) {
    const b = PROJECTS.find((p) => p.cat === cat);
    const ex = b.type === 'exit';
    setF((x) => ({ ...x, cat, price: b.price, ret: ex ? Math.round((b.payout / b.price - 1) * 100) : b.yld * 100, term: ex ? b.months : b.years }));
  }

  const fee = f.amount * FEE.raise;
  const years = exit ? f.term / 12 : f.term;
  const cost = exit ? (f.amount * f.ret) / 100 : (f.amount * f.ret * f.term) / 100;
  const yearly = ((cost + fee) / f.amount / years) * 100;
  const tokens = Math.round(f.amount / f.price);
  const ok = f.company.trim() && f.name.trim() && f.loc.trim() && f.amount >= 100000 && f.amount <= 5000000;
  const last = STILLS[f.cat] - 1;

  return (
    <>
      <EnNote />
      <section className="ow-hero">
        <img src={still('stroitelstvo', 2)} alt="" />
        <div className="ow-hero-shade" />
        <div className="ow-hero-txt">
          <div className="eyebrow">За строители, оператори и собственици на активи</div>
          <h1>Финансирай проекта си чрез токени</h1>
          <p className="lead">Набери до 5 000 000 € от много инвеститори, без да даваш дял от фирмата си и без да чакаш банка.</p>
          <div className="row">
            <a className="btn" href="#form">Подай заявка</a>
            <a className="btn ghost lg" href="#how">Как работи</a>
          </div>
        </div>
        <div className="ow-facts">
          <div><b>до 5 млн. €</b><span>за 12 месеца</span></div>
          <div><b>4%</b><span>такса само при успех</span></div>
          <div><b>3–6 седм.</b><span>до обявяване</span></div>
        </div>
      </section>

      <section className="ow-steps" id="how">
        {STEPS.map(([t, d, i]) => (
          <div key={t} className="ow-step">
            <img src={thumb('stroitelstvo', i + 1)} alt="" loading="lazy" decoding="async" />
            <div className="ow-step-shade" />
            <span className="ow-n">{String(i + 1).padStart(2, '0')}</span>
            <div className="ow-step-txt"><b>{t}</b><p>{d}</p></div>
          </div>
        ))}
      </section>

      <section className="two wide-left" id="form">
        <div className="card">
          {sent ? (
            <div className="center-txt">
              <div className="okmark">✓</div>
              <h2>Заявката е изпратена</h2>
              <p className="muted">В демото можеш веднага да я одобриш от админ панела и проектът ще се появи в каталога със своя страница.</p>
              <div className="row end center">
                <button className="btn ghost" onClick={() => setSent(false)}>Нова заявка</button>
                <Link className="btn sm" href="/admin#apps">Към админ панела</Link>
              </div>
            </div>
          ) : (
            <>
              <h3>Заявка за финансиране</h3>
              <label>Какъв е проектът?</label>
              <div className="ow-cats">
                {CATS.map((x) => (
                  <button key={x.slug} className={f.cat === x.slug ? 'on' : ''} onClick={() => pick(x.slug)}>
                    <img src={thumb(x.slug, STILLS[x.slug] - 1)} alt="" loading="lazy" decoding="async" />
                    <span>{x.name}</span>
                  </button>
                ))}
              </div>
              <div className="form2">
                <div><label>Фирма</label><input type="text" value={f.company} onChange={(e) => set('company', e.target.value)} placeholder="„Примерна фирма“ ООД" /></div>
                <div><label>Име на проекта</label><input type="text" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Напр. Сграда „Изгрев“" /></div>
                <div><label>Местоположение</label><input type="text" value={f.loc} onChange={(e) => set('loc', e.target.value)} placeholder="Град, квартал" /></div>
                <div>
                  <label>Цена на един токен</label>
                  <div className="seg ow-seg">
                    {[500, 1000, 2500, 5000].map((v) => <button key={v} className={f.price === v ? 'on' : ''} onClick={() => set('price', v)}>{eur(v)}</button>)}
                  </div>
                </div>
              </div>
              <div className="ow-sliders">
                <div><label>Търсена сума</label><b>{eur(f.amount)}</b><input type="range" min="100000" max="5000000" step="50000" value={f.amount} onChange={(e) => set('amount', +e.target.value)} /></div>
                <div><label>Доходност за инвеститорите</label><b>{f.ret}% {exit ? 'за срока' : 'годишно'}</b><input type="range" min="3" max="30" step="0.5" value={f.ret} onChange={(e) => set('ret', +e.target.value)} /></div>
                <div><label>Срок</label><b>{f.term} {exit ? 'месеца' : 'години'}</b><input type="range" min={exit ? 6 : 3} max={exit ? 36 : 10} value={f.term} onChange={(e) => set('term', +e.target.value)} /></div>
              </div>
              <button className="btn" disabled={!ok} onClick={() => { addApp(f); setSent(true); }}>Изпрати заявката</button>
              {!ok && <p className="muted small">Попълни фирма, име и местоположение.</p>}
            </>
          )}
        </div>

        <div className="ow-side">
          <div className="ow-preview">
            <div className="eyebrow">Така ще изглежда в каталога</div>
            <div className="pcard ow-pcard">
              <div className="ow-pimg"><img src={thumb(f.cat, last)} alt="" loading="lazy" decoding="async" key={f.cat} /><span className="tag ok">Набира средства</span></div>
              <div className="pc-body">
                <div className="eyebrow">{f.loc || 'Местоположение'}</div>
                <h3>{f.name || 'Името на проекта'}</h3>
                <p className="muted small">{c.name} · {f.company || 'твоята фирма'}</p>
                <div className="pc-nums">
                  <div><span>Токен</span><b>{eur(f.price)}</b></div>
                  <div><span>Доходност</span><b className="gold">{f.ret}%{exit ? '' : ' год.'}</b></div>
                  <div><span>Срок</span><b>{f.term} {exit ? 'мес.' : 'год.'}</b></div>
                </div>
                <div className="bar"><i style={{ width: '0%' }} /></div>
                <div className="pc-foot"><span>0 / {tokens} токена</span><span className="gold">цел {eur(f.amount)}</span></div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Колко ще ти струва</h3>
            <div className="ow-big"><span>Получаваш за проекта</span><b>{eur(f.amount - fee)}</b></div>
            <table className="tbl">
              <tbody>
                <tr><td>Търсена сума</td><td>{eur(f.amount)}</td></tr>
                <tr><td>Такса на платформата (4%, само при успех)</td><td>−{eur(fee)}</td></tr>
                <tr><td>Доход за инвеститорите за срока</td><td>{eur(cost)}</td></tr>
                <tr><td>Връщаш общо</td><td>{eur(f.amount + cost)}</td></tr>
                <tr className="hl"><td>Цена на финансирането на година</td><td>{yearly.toFixed(1)}%</td></tr>
              </tbody>
            </table>
            <p className="muted small">{exit ? 'Плюс 10% от печалбата на проекта за платформата при успешна продажба.' : 'Плюс 1% годишна такса за управление към платформата.'} Таксите са примерен модел за демото, а не пазарни ставки.</p>
          </div>

          <div className="card">
            <h3>Какво трябва да имаш</h3>
            <ul className="checks">
              <li>Документи за собственост и нужните разрешения.</li>
              <li>Собствено участие в проекта, обикновено поне 20–30%.</li>
              <li>Подробен бюджет и готовност за независима оценка.</li>
              <li>Съгласие активът да е в отделно дружество с обезпечение за инвеститорите.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
