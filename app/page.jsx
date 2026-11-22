'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useStore } from './providers';
import { P, STAGES, eur } from '../lib/data';

const Building3D = dynamic(() => import('../components/Building3D'), { ssr: false });

function Countdown({ to }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const d = Math.max(0, to - now);
  const parts = [
    [Math.floor(d / 864e5), 'дни'],
    [Math.floor(d / 36e5) % 24, 'часа'],
    [Math.floor(d / 6e4) % 60, 'мин'],
    [Math.floor(d / 1e3) % 60, 'сек'],
  ];
  return (
    <div className="cd">
      {parts.map(([v, l]) => (
        <div key={l}>
          <b>{String(v).padStart(2, '0')}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Calculator() {
  const [n, setN] = useState(2);
  const [sc, setSc] = useState(0);
  const scen = [
    { t: 'По план', m: 24, out: P.payout, note: 'Сградата се продава в срок и токенът се изплаща по 6 000 €.' },
    { t: 'Забава 6 месеца', m: 30, out: P.payout, note: 'Същата сума, но по-късно: годишната доходност пада.' },
    { t: 'Ранен изход (месец 12)', m: 12, out: 5400 * (1 - P.feeTrade), note: 'Продажба на вторичния пазар на ~5 400 € минус 1% такса. Зависи дали има купувач.' },
  ][sc];
  const inv = n * P.price;
  const out = n * scen.out;
  const yr = (Math.pow(out / inv, 12 / scen.m) - 1) * 100;
  return (
    <div className="card calc">
      <h3>Калкулатор за инвеститора</h3>
      <label>
        Брой токени: <b>{n}</b>
      </label>
      <input type="range" min="1" max="20" value={n} onChange={(e) => setN(+e.target.value)} />
      <div className="seg">
        {['По план', 'Забава 6 месеца', 'Ранен изход (месец 12)'].map((t, i) => (
          <button key={t} className={sc === i ? 'on' : ''} onClick={() => setSc(i)}>
            {t}
          </button>
        ))}
      </div>
      <div className="calc-grid">
        <div><span>Влагаш</span><b>{eur(inv)}</b></div>
        <div><span>Получаваш след {scen.m} мес.</span><b className="gold">{eur(out)}</b></div>
        <div><span>Печалба</span><b className="green">+{eur(out - inv)}</b></div>
        <div><span>≈ годишно</span><b>{yr.toFixed(1)}%</b></div>
      </div>
      <p className="muted small">{scen.note} Цифрите са илюстрация, не обещание.</p>
    </div>
  );
}

export default function Home() {
  const { s, buyPrimary, tick, complete } = useStore();
  const [q, setQ] = useState(1);
  const [flash, setFlash] = useState(false);
  const open = s.stage === 0 && s.sold < P.tokens;
  const pct = (s.sold / P.tokens) * 100;

  useEffect(() => {
    if (!open) return;
    const i = setInterval(() => {
      if (Math.random() < 0.45) {
        tick();
        setFlash(true);
        setTimeout(() => setFlash(false), 900);
      }
    }, 3500);
    return () => clearInterval(i);
  }, [open, tick]);

  const profit = P.revenue - P.cost;
  return (
    <>
      <section className="hero">
        <div className="hero-3d">
          <Building3D stage={s.stage} aptsSold={s.aptsSold} height={560} />
          <div className="stage-chip">Етап: {STAGES[s.stage].k} · завърти с мишката</div>
        </div>
        <div className="hero-txt">
          <div className="eyebrow">{P.city} · {P.apts} апартамента · 2 400 кв. м</div>
          <h1>{P.name}</h1>
          <p className="lead">
            Сграда, финансирана от 200 дигитални дяла. Един токен струва <b>5 000 €</b> и носи прогнозно{' '}
            <b>6 000 €</b> след 24 месеца.
          </p>
          <div className={'card sale' + (flash ? ' flash' : '')}>
            <div className="sale-top">
              <div>
                <span className="muted">Продадени токени</span>
                <div className="big">
                  {s.sold} <small>/ {P.tokens}</small>
                </div>
              </div>
              <div className="right">
                <span className="muted">Набрани</span>
                <div className="big gold">{eur(s.sold * P.price)}</div>
              </div>
            </div>
            <div className="bar"><i style={{ width: pct + '%' }} /></div>
            {open ? (
              <>
                <div className="sale-mid">
                  <span className="muted">Кампанията приключва след</span>
                  <Countdown to={s.deadline} />
                </div>
                <div className="buy">
                  <div className="qty">
                    <button onClick={() => setQ(Math.max(1, q - 1))}>−</button>
                    <b>{q}</b>
                    <button onClick={() => setQ(Math.min(P.tokens - s.sold, q + 1))}>+</button>
                  </div>
                  <button className="btn" onClick={() => buyPrimary(q)} disabled={s.cash < q * P.price}>
                    Купи за {eur(q * P.price)}
                  </button>
                </div>
                <p className="muted small">
                  Парите стоят в ескроу сметка. Ако не се наберат всички 200 токена, получаваш си ги обратно изцяло.{' '}
                  <a onClick={complete}>Демо: приключи набирането сега →</a>
                </p>
              </>
            ) : (
              <p className="ok">
                ✓ Набирането е успешно. Токените вече се търгуват на <Link href="/market">вторичния пазар</Link>.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="kpis">
        {[
          ['Цена на токен', eur(P.price)],
          ['Прогнозно изплащане', eur(P.payout)],
          ['Прогнозна доходност', '20% за 24 мес.'],
          ['Обезпечение', 'Ипотека + SPV'],
        ].map(([l, v]) => (
          <div key={l} className="card kpi">
            <span>{l}</span>
            <b>{v}</b>
          </div>
        ))}
      </section>

      <section className="two">
        <Calculator />
        <div className="card">
          <h3>200 токена на живо</h3>
          <div className="grid200">
            {Array.from({ length: P.tokens }, (_, i) => {
              const others = s.sold - s.mine;
              const c = i < others ? 'sold' : i < s.sold ? 'mine' : 'free';
              return <i key={i} className={c} />;
            })}
          </div>
          <div className="legend">
            <span><i className="sold" /> продадени</span>
            <span><i className="mine" /> твои ({s.mine})</span>
            <span><i className="free" /> свободни ({P.tokens - s.sold})</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h3>График на проекта</h3>
        <div className="timeline">
          {STAGES.map((st, i) => (
            <div key={st.k} className={'tl' + (i < s.stage ? ' done' : i === s.stage ? ' now' : '')}>
              <div className="dot" />
              <b>{st.short}</b>
              <span>месец {st.month}</span>
              <em>~{eur(st.fair)}</em>
            </div>
          ))}
        </div>
        <p className="muted small">
          Под всеки етап е ориентировъчната стойност на един токен (илюстрация). Графикът тече от деня на успешното набиране.
        </p>
      </section>

      <section className="two">
        <div className="card">
          <h3>Финансиране на сградата</h3>
          <table className="tbl">
            <tbody>
              <tr><td>Обща цена на строежа</td><td>{eur(P.cost)}</td></tr>
              <tr><td>Собствени средства на строителя</td><td>{eur(P.ownFunds)}</td></tr>
              <tr><td>Банков кредит</td><td>{eur(P.bank)}</td></tr>
              <tr className="hl"><td>Токени (200 × 5 000 €)</td><td>{eur(P.tokens * P.price)}</td></tr>
              <tr><td>Очаквани продажби (1 400 €/кв. м)</td><td>{eur(P.revenue)}</td></tr>
              <tr><td>Очаквана печалба на проекта</td><td>{eur(profit)}</td></tr>
            </tbody>
          </table>
          <p className="muted small">Строител: {P.builder}. Собственик на имота: {P.spv}.</p>
        </div>
        <div className="card">
          <h3>Как са защитени инвеститорите</h3>
          <ul className="checks">
            <li><b>Всичко или нищо.</b> Без 200 продадени токена до крайния срок парите се връщат.</li>
            <li><b>Ескроу сметка.</b> Средствата не минават през платформата.</li>
            <li><b>Отделно дружество (SPV).</b> Сградата не е собственост на строителя.</li>
            <li><b>Ипотека</b> в полза на инвеститорите чрез независим довереник.</li>
            <li><b>Плащане на траншове</b> само след потвърждение от строителен надзор.</li>
            <li><b>Месечни отчети</b> със снимки, разходи и издадени актове.</li>
          </ul>
        </div>
      </section>

      <section className="card">
        <h3>Новини от проекта</h3>
        <ul className="news">
          {s.news.map((n, i) => (
            <li key={i}>
              <span>{n.d}</span>
              {n.t}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
