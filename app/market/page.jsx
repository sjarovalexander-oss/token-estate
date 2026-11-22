'use client';
import { useEffect, useState } from 'react';
import { useStore } from '../providers';
import { P, STAGES, fairValue, eur } from '../../lib/data';

function Chart({ stage, trades }) {
  const W = 640, H = 240, pad = 36;
  const x = (m) => pad + (m / 24) * (W - pad * 2);
  const y = (v) => H - pad - ((v - 4800) / 1300) * (H - pad * 2);
  const pts = STAGES.map((s) => [x(s.month), y(s.fair)]);
  const line = (a) => a.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const past = pts.slice(0, stage + 1);
  const fut = pts.slice(stage);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      {[5000, 5500, 6000].map((v) => (
        <g key={v}>
          <line x1={pad} x2={W - pad} y1={y(v)} y2={y(v)} className="gl" />
          <text x={4} y={y(v) + 4}>{v}</text>
        </g>
      ))}
      <path d={line(fut)} className="fut" />
      {past.length > 1 && <path d={line(past)} className="past" />}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={i === stage ? 7 : 4} className={i <= stage ? 'pd' : 'fd'} />
          <text x={p[0]} y={H - 10} textAnchor="middle">{STAGES[i].short}</text>
        </g>
      ))}
      {trades.slice(-12).map((t, i) => (
        <circle key={i} cx={pts[stage][0] + 10 + i * 6} cy={y(t.price)} r="3" className="tr" />
      ))}
    </svg>
  );
}

export default function Market() {
  const { s, buyListing, listMine, cancelListing, botBuy, complete } = useStore();
  const fair = fairValue(s);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(fair);
  const [msg, setMsg] = useState('');
  const openMkt = s.stage > 0;
  const listed = s.listings.filter((l) => l.mine).reduce((a, l) => a + l.qty, 0);
  const free = s.mine - listed;

  useEffect(() => setPrice(fair), [fair]);

  // демо купувач: взима твоята обява, ако цената е близо до ориентировъчната
  useEffect(() => {
    const mine = s.listings.find((l) => l.mine && l.off <= 120);
    if (!mine || !openMkt) return;
    const t = setTimeout(() => {
      botBuy(mine.id);
      setMsg('Купувач прие обявата ти. Сумата е в портфейла.');
    }, 4000);
    return () => clearTimeout(t);
  }, [s.listings, openMkt, botBuy]);

  if (!openMkt)
    return (
      <section className="card center">
        <h2>Вторичният пазар още не е отворен</h2>
        <p className="muted">
          Токените се търгуват между инвеститорите едва след успешното набиране на всички 200 токена. Продадени досега:{' '}
          {s.sold} / {P.tokens}.
        </p>
        <button className="btn" onClick={complete}>Демо: приключи набирането успешно</button>
      </section>
    );

  const sorted = [...s.listings].sort((a, b) => a.off - b.off);
  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">Вторичен пазар · {P.name}</div>
          <h1>Купи или продай токен преди края на проекта</h1>
        </div>
        <div className="card kpi">
          <span>Ориентировъчна стойност · {STAGES[s.stage].short}</span>
          <b className="gold">{eur(fair)}</b>
        </div>
      </section>

      <section className="two wide-left">
        <div className="card">
          <h3>Стойност на токена по етапи</h3>
          <Chart stage={s.stage} trades={s.trades} />
          <p className="muted small">
            Плътната линия е изминатият път, пунктирът е илюстративна прогноза до изплащането по 6 000 €. Сините точки са
            сделки. Цената се определя от купувачите и продавачите и може да падне при забава на строежа.
          </p>
        </div>
        <div className="card">
          <h3>Продай свои токени</h3>
          <p className="muted small">Свободни за продажба: {free} от {s.mine}</p>
          <label>Брой</label>
          <input type="number" min="1" max={Math.max(1, free)} value={qty} onChange={(e) => setQty(+e.target.value)} />
          <label>Цена за токен (€)</label>
          <input type="number" step="10" value={price} onChange={(e) => setPrice(+e.target.value)} />
          <p className="muted small">
            Получаваш {eur(qty * price * (1 - P.feeTrade))} след 1% такса на платформата.
          </p>
          <button
            className="btn"
            disabled={free < 1 || qty < 1 || qty > free}
            onClick={() => {
              listMine(qty, price);
              setMsg(
                price - fair <= 120
                  ? 'Обявата е публикувана. Чака купувач…'
                  : 'Обявата е публикувана. Цената е доста над ориентировъчната и може да няма купувач.'
              );
            }}
          >
            Пусни обява
          </button>
          {msg && <p className="ok small">{msg}</p>}
        </div>
      </section>

      <section className="card">
        <h3>Обяви за продажба</h3>
        <table className="tbl full">
          <thead>
            <tr><th>Продавач</th><th>Брой</th><th>Цена за токен</th><th>Спрямо ориентира</th><th>Общо</th><th /></tr>
          </thead>
          <tbody>
            {sorted.map((l) => {
              const p = fair + l.off;
              return (
                <tr key={l.id} className={l.mine ? 'hl' : ''}>
                  <td>{l.seller}</td>
                  <td>{l.qty}</td>
                  <td>{eur(p)}</td>
                  <td className={l.off <= 0 ? 'green' : 'muted'}>{l.off > 0 ? '+' : ''}{((l.off / fair) * 100).toFixed(1)}%</td>
                  <td>{eur(p * l.qty)}</td>
                  <td className="right">
                    {l.mine ? (
                      <button className="btn ghost" onClick={() => cancelListing(l.id)}>Свали</button>
                    ) : (
                      <button className="btn sm" disabled={s.cash < p * l.qty} onClick={() => buyListing(l.id)}>Купи</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!sorted.length && <tr><td colSpan="6" className="muted">Няма активни обяви.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Последни сделки</h3>
        {s.trades.length ? (
          <ul className="news">
            {[...s.trades].reverse().slice(0, 8).map((t, i) => (
              <li key={i}><span>{t.qty} бр.</span>{eur(t.price)} за токен</li>
            ))}
          </ul>
        ) : (
          <p className="muted">Още няма сделки. Купи обява отгоре или пусни своя.</p>
        )}
      </section>
    </>
  );
}
