'use client';
import { useEffect, useState } from 'react';
import { useStore } from '../providers';
import ProjectPicker, { usePicked } from '../../components/ProjectPicker';
import { FEE, getP, fairValue, eur, totalPer } from '../../lib/data';

function Chart({ p, stage, trades }) {
  const W = 640, H = 240, pad = 44;
  const maxM = p.stages[p.stages.length - 1].month || 1;
  const lo = p.price * 0.96, hi = Math.max(...p.stages.map((s) => s.fair), p.type === 'exit' ? p.payout : 0) * 1.02;
  const x = (m) => pad + (m / maxM) * (W - pad * 2);
  const y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2);
  const pts = p.stages.map((s) => [x(s.month), y(s.fair)]);
  const line = (a) => a.map((q, i) => (i ? 'L' : 'M') + q[0] + ' ' + q[1]).join(' ');
  const ticks = [p.price, Math.round((p.price + hi / 1.02) / 2), Math.round(hi / 1.02)];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad} x2={W - pad} y1={y(v)} y2={y(v)} className="gl" />
          <text x={4} y={y(v) + 4}>{v}</text>
        </g>
      ))}
      <path d={line(pts.slice(stage))} className="fut" />
      {stage > 0 && <path d={line(pts.slice(0, stage + 1))} className="past" />}
      {pts.map((q, i) => (
        <g key={i}>
          <circle cx={q[0]} cy={q[1]} r={i === stage ? 7 : 4} className={i <= stage ? 'pd' : 'fd'} />
          <text x={q[0]} y={H - 12 + (i % 2) * 11} textAnchor="middle">{p.stages[i].short}</text>
        </g>
      ))}
      {trades.slice(-12).map((t, i) => (
        <circle key={i} cx={Math.min(W - pad, pts[stage][0] + 10 + i * 6)} cy={y(t.price)} r="3" className="tr" />
      ))}
    </svg>
  );
}

export default function Market() {
  const { s, buyListing, listMine, cancelListing, botBuy, complete } = useStore();
  const [pid, setPid] = usePicked();
  const p = getP(pid);
  const ps = s.proj[pid];
  const fair = fairValue(p, ps);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(fair);
  const [msg, setMsg] = useState('');
  const openMkt = ps.stage > 0;
  const listed = ps.listings.filter((l) => l.mine).reduce((a, l) => a + l.qty, 0);
  const free = ps.mine - listed;
  const near = p.price * 0.024;

  useEffect(() => { setPrice(fair); setMsg(''); }, [fair, pid]);

  // демо купувач: взима твоята обява, ако цената е близо до ориентировъчната
  useEffect(() => {
    const mine = ps.listings.find((l) => l.mine && l.off <= near);
    if (!mine || !openMkt) return;
    const t = setTimeout(() => {
      botBuy(pid, mine.id);
      setMsg('Купувач прие обявата ти. Сумата е в портфейла.');
    }, 4000);
    return () => clearTimeout(t);
  }, [ps.listings, openMkt, botBuy, pid, near]);

  const sorted = [...ps.listings].sort((a, b) => a.off - b.off);
  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">Вторичен пазар</div>
          <h1>Купи или продай токен преди края на проекта</h1>
        </div>
        <div className="card kpi">
          <span>Ориентировъчна стойност · {p.stages[ps.stage].short}</span>
          <b className="gold">{eur(fair)}</b>
        </div>
      </section>
      <ProjectPicker pid={pid} setPid={setPid} />

      {!openMkt ? (
        <section className="card center">
          <h2>Пазарът за „{p.name}“ още не е отворен</h2>
          <p className="muted">
            Токените се търгуват между инвеститорите едва след успешното набиране. Продадени досега: {ps.sold} / {p.tokens}.
          </p>
          <button className="btn sm" onClick={() => complete(pid)}>Демо: приключи набирането успешно</button>
        </section>
      ) : (
        <>
          <section className="two wide-left">
            <div className="card">
              <h3>Стойност на токена по етапи · {p.name}</h3>
              <Chart p={p} stage={ps.stage} trades={ps.trades} />
              <p className="muted small">
                Плътната линия е изминатият път, пунктирът е илюстративна прогноза. Сините точки са сделки. Общо очаквано за
                един токен до края: {eur(totalPer(p))}. Цената се определя от купувачите и продавачите и може да падне.
              </p>
            </div>
            <div className="card">
              <h3>Продай свои токени</h3>
              <p className="muted small">Свободни за продажба: {free} от {ps.mine}</p>
              <label>Брой</label>
              <input type="number" min="1" max={Math.max(1, free)} value={qty} onChange={(e) => setQty(+e.target.value)} />
              <label>Цена за токен (€)</label>
              <input type="number" step="5" value={price} onChange={(e) => setPrice(+e.target.value)} />
              <p className="muted small">Получаваш {eur(qty * price * (1 - FEE.trade))} след 1% такса на платформата.</p>
              <button
                className="btn"
                disabled={free < 1 || qty < 1 || qty > free}
                onClick={() => {
                  listMine(pid, qty, price);
                  setMsg(price - fair <= near ? 'Обявата е публикувана. Чака купувач…' : 'Обявата е публикувана. Цената е доста над ориентировъчната и може да няма купувач.');
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
                  const pr = fair + l.off;
                  return (
                    <tr key={l.id} className={l.mine ? 'hl' : ''}>
                      <td>{l.seller}</td>
                      <td>{l.qty}</td>
                      <td>{eur(pr)}</td>
                      <td className={l.off <= 0 ? 'green' : 'muted'}>{l.off > 0 ? '+' : ''}{((l.off / fair) * 100).toFixed(1)}%</td>
                      <td>{eur(pr * l.qty)}</td>
                      <td className="right">
                        {l.mine ? (
                          <button className="btn ghost" onClick={() => cancelListing(pid, l.id)}>Свали</button>
                        ) : (
                          <button className="btn sm" disabled={s.cash < pr * l.qty} onClick={() => buyListing(pid, l.id)}>Купи</button>
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
            {ps.trades.length ? (
              <ul className="news">
                {[...ps.trades].reverse().slice(0, 8).map((t, i) => (
                  <li key={i}><span>{t.qty} бр.</span>{eur(t.price)} за токен</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Още няма сделки. Купи обява отгоре или пусни своя.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
