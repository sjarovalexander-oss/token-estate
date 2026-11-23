'use client';
import { EnNote } from '../../lib/brand';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../providers';
import { usePicked } from '../../components/ProjectPicker';
import { FEE, PROJECTS, getP, getC, fairValue, still, thumb, eur, totalPer, last } from '../../lib/data';

const frameOf = (p, st) => (p.frames ? p.frames[st] : Math.min(st, 3));
const pctTxt = (v) => (v >= 0 ? '+' : '') + (v * 100).toFixed(1) + '%';
const BUYERS = ['Инвеститор #214', 'Инвеститор #087', 'Инвеститор #331', 'Инвеститор #052', 'Инвеститор #178', 'Инвеститор #406', 'Инвеститор #129'];

function Chart({ p, ps, trades, live }) {
  const W = 760, H = 280, pl = 52, pr = 18, pt = 16, pb = 40;
  const maxM = p.stages[last(p)].month || 1;
  const top = Math.max(...p.stages.map((s) => s.fair), p.type === 'exit' ? p.payout : 0);
  const lo = p.price * 0.96, hi = top * 1.02;
  const x = (m) => pl + (m / maxM) * (W - pl - pr);
  const y = (v) => H - pb - ((v - lo) / (hi - lo)) * (H - pt - pb);
  const pts = p.stages.map((s) => [x(s.month), y(s.fair)]);
  const path = (a) => a.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  const past = pts.slice(0, ps.stage + 1);
  const cur = pts[ps.stage];
  const ticks = [p.price, Math.round((p.price + top) / 2), top];
  const dots = [...trades.map((t) => t.price), ...live.map((t) => t.price)].slice(-16);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mk-chart">
      <defs>
        <linearGradient id="mkg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8b36a" stopOpacity=".35" />
          <stop offset="1" stopColor="#d8b36a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} className="gl" />
          <text x={pl - 8} y={y(v) + 4} textAnchor="end">{v.toLocaleString('bg-BG')}</text>
        </g>
      ))}
      <path d={path(pts)} className="fut" />
      {past.length > 1 && <path d={path(past) + ` L${cur[0]} ${H - pb} L${pts[0][0]} ${H - pb} Z`} fill="url(#mkg)" />}
      {past.length > 1 && <path d={path(past)} className="past" />}
      {pts.map((q, i) => (
        <g key={i}>
          <circle cx={q[0]} cy={q[1]} r={i === ps.stage ? 0 : 4} className={i <= ps.stage ? 'pd' : 'fd'} />
          <text x={q[0]} y={H - 14 + (i % 2) * 12} textAnchor="middle">{p.stages[i].short}</text>
        </g>
      ))}
      <circle cx={cur[0]} cy={cur[1]} r="14" className="pulse" />
      <circle cx={cur[0]} cy={cur[1]} r="7" className="pd" />
      {dots.map((v, i) => (
        <circle key={i} cx={Math.min(W - pr - 4, cur[0] + 16 + i * 7)} cy={y(v)} r="3.5" className="tr" />
      ))}
    </svg>
  );
}

export default function Market() {
  const { s, buyListing, listMine, cancelListing, botBuy, complete } = useStore();
  const [pid, setPid] = usePicked();
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('p')) return;
    const open = PROJECTS.find((x) => s.proj[x.id].stage > 0);
    if (open) setPid(open.id);
    // само при първо отваряне
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const p = getP(pid) || PROJECTS[0];
  const ps = s.proj[p.id];
  const c = getC(p.cat);
  const fair = fairValue(p, ps);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(fair);
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState('');
  const [live, setLive] = useState([]);
  const [flash, setFlash] = useState(0);
  const openMkt = ps.stage > 0;
  const listed = ps.listings.filter((l) => l.mine).reduce((a, l) => a + l.qty, 0);
  const free = ps.mine - listed;
  const near = p.price * 0.024;
  const t0 = useRef(null);

  useEffect(() => { setPrice(fair); setMsg(''); setLive([]); setQty(1); }, [fair, p.id]);
  const say = (t) => { setToast(t); clearTimeout(t0.current); t0.current = setTimeout(() => setToast(''), 3200); };

  // демо купувач: взима твоята обява, ако цената е близо до ориентировъчната
  useEffect(() => {
    const mine = ps.listings.find((l) => l.mine && l.off <= near);
    if (!mine || !openMkt) return;
    const t = setTimeout(() => {
      botBuy(p.id, mine.id);
      setMsg('');
      say('✓ Купувач прие обявата ти. Сумата е в портфейла.');
    }, 3500);
    return () => clearTimeout(t);
  }, [ps.listings, openMkt, botBuy, p.id, near]);

  // сделки на живо между други инвеститори (илюстрация)
  useEffect(() => {
    if (!openMkt) return;
    const i = setInterval(() => {
      const pr = Math.round((fair * (1 + (Math.random() - 0.45) * 0.03)) / 5) * 5;
      setLive((l) => [...l, { price: pr, qty: 1 + Math.floor(Math.random() * 3), who: BUYERS[Math.floor(Math.random() * BUYERS.length)], at: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }].slice(-12));
      setFlash((f) => f + 1);
    }, 4200);
    return () => clearInterval(i);
  }, [openMkt, fair]);

  const asks = [...ps.listings].sort((a, b) => a.off - b.off);
  const best = asks.find((l) => !l.mine);
  const maxQty = Math.max(1, ...asks.map((l) => l.qty));
  const lastTrade = live.length ? live[live.length - 1].price : ps.trades.length ? ps.trades[ps.trades.length - 1].price : fair;
  const chg = fair / p.price - 1;
  const vol = [...ps.trades, ...live].reduce((a, t) => a + t.price * t.qty, 0);
  const sellLevel = price - fair <= near ? ['fast', 'Бърза продажба: цената е близо до ориентира'] : price - fair <= near * 3 ? ['mid', 'Може да отнеме време'] : ['slow', 'Вероятно няма да намери купувач'];

  const cards = useMemo(() => [...PROJECTS].sort((a, b) => (s.proj[b.id].stage > 0) - (s.proj[a.id].stage > 0)).map((x) => {
    const xs = s.proj[x.id];
    const f = fairValue(x, xs);
    return { x, xs, f, chg: f / x.price - 1 };
  }), [s.proj]);

  return (
    <>
      <EnNote />
      <section className="mk-hero">
        <img key={p.id + ps.stage} src={still(p.cat, frameOf(p, ps.stage))} alt="" className="on" fetchpriority="high" />
        <div className="mk-hero-shade" />
        <div className="mk-hero-txt">
          <div className="eyebrow">Табло за обяви · {c.icon} {c.name}</div>
          <h1>{p.name}</h1>
          <p className="lead">Обяви между инвеститори за прехвърляне на токени, преди проектът да е приключил. Платформата не е място за търговия.</p>
          <div className="mk-stage"><i /> Етап: {p.stages[ps.stage].k}</div>
        </div>
        <div className="mk-price card">
          <span>Ориентировъчна стойност</span>
          <b className={flash ? 'tick' : ''} key={flash}>{eur(openMkt ? lastTrade : fair)}</b>
          <em className={chg >= 0 ? 'green' : 'red'}>{pctTxt(chg)} спрямо първичната цена {eur(p.price)}</em>
          <div className="mk-mini">
            <div><span>Най-добра оферта</span><b>{best ? eur(fair + best.off) : '–'}</b></div>
            <div><span>Обяви</span><b>{asks.length}</b></div>
            <div><span>Обем</span><b>{eur(vol)}</b></div>
          </div>
        </div>
      </section>

      <section className="mk-pick">
        {cards.map(({ x, xs, f, chg: ch }) => (
          <button key={x.id} className={'mk-card' + (x.id === p.id ? ' on' : '')} onClick={() => setPid(x.id)}>
            <img src={thumb(x.cat, frameOf(x, xs.stage))} alt="" loading="lazy" decoding="async" />
            <div className="mk-card-shade" />
            <div className="mk-card-body">
              <span>{getC(x.cat).icon} {x.name}</span>
              <b>{eur(f)}</b>
              <em className={xs.stage === 0 ? 'muted' : ch >= 0 ? 'green' : 'red'}>{xs.stage === 0 ? 'набиране' : pctTxt(ch)}</em>
            </div>
          </button>
        ))}
      </section>

      <div className="mk-disc">
        <b>ⓘ Табло за обяви, не борса.</b> Платформата само показва обяви на инвеститори, които искат да прехвърлят токени. Не съпоставя поръчки, не определя цена и не гарантира, че ще има купувач. Ориентировъчната стойност е изчислена по етапа на проекта и е само за информация. Всяко прехвърляне се потвърждава от продавача.
      </div>

      {toast && <div className="mk-toast">{toast}</div>}

      {!openMkt ? (
        <section className="card center mk-closed">
          <div className="okmark" style={{ background: 'var(--gold)', boxShadow: '0 0 0 10px rgba(216,179,106,.15)' }}>⏳</div>
          <h2>Обявите за „{p.name}“ още не са отворени</h2>
          <p className="muted">Обявите между инвеститори се отварят едва след успешното набиране. Продадени досега: {ps.sold} от {p.tokens}.</p>
          <div className="bar" style={{ maxWidth: 420, margin: '14px auto' }}><i style={{ width: (ps.sold / p.tokens) * 100 + '%' }} /></div>
          <div className="row center">
            <Link className="btn ghost" href={'/project/' + p.id}>Към набирането</Link>
          </div>
        </section>
      ) : (
        <>
          <section className="two wide-left">
            <div className="card">
              <div className="mk-head">
                <h3>Стойност на токена по етапи</h3>
                <span className="muted small">общо очаквано до края: <b className="gold">{eur(totalPer(p))}</b></span>
              </div>
              <Chart p={p} ps={ps} trades={ps.trades} live={live} />
              <p className="muted small">Плътната линия е изминатият път, пунктирът е прогноза до края. Сините точки са последните прехвърляния. Ориентировъчната стойност е само за информация; цената се договаря между продавача и купувача и може да падне при забава.</p>
            </div>
            <div className="card mk-live">
              <div className="mk-head">
                <h3>Последни прехвърляния</h3>
                <span className="live-dot">● обновява се</span>
              </div>
              <ul>
                {[...live].reverse().slice(0, 7).map((t, i) => (
                  <li key={t.at + i} className={i === 0 ? 'new' : ''}>
                    <span className="muted">{t.at}</span>
                    <span>{t.who}</span>
                    <b>{t.qty} × {eur(t.price)}</b>
                  </li>
                ))}
                {!live.length && <li className="muted">Изчакване на следващото прехвърляне…</li>}
              </ul>
              <p className="muted small">Прехвърлянията между други инвеститори са симулирани за демото.</p>
            </div>
          </section>

          <section className="two wide-left">
            <div className="card">
              <div className="mk-head">
                <h3>Обяви за продажба</h3>
                <span className="muted small">най-евтините са най-отгоре</span>
              </div>
              <div className="mk-book">
                {asks.map((l) => {
                  const pr = fair + l.off;
                  return (
                    <div key={l.id} className={'mk-row' + (l.mine ? ' mine' : '')}>
                      <i className="depth" style={{ width: (l.qty / maxQty) * 100 + '%' }} />
                      <span className="who">{l.mine ? '★ Твоята обява' : l.seller}</span>
                      <span>{l.qty} бр.</span>
                      <b>{eur(pr)}</b>
                      <span className={l.off <= 0 ? 'green' : 'muted'}>{pctTxt(l.off / fair)}</span>
                      {l.mine ? (
                        <button className="btn ghost" onClick={() => cancelListing(p.id, l.id)}>Свали</button>
                      ) : (
                        <button className="btn sm" disabled={s.cash < pr * l.qty} onClick={() => { buyListing(p.id, l.id); say(`✓ Продавачът потвърди. Получи ${l.qty} ${l.qty === 1 ? 'токен' : 'токена'} за ${eur(pr * l.qty)}`); }}>
                          Заяви покупка · {eur(pr * l.qty)}
                        </button>
                      )}
                    </div>
                  );
                })}
                {!asks.length && <p className="muted">Няма активни обяви. Пусни своя отдясно.</p>}
              </div>
            </div>

            <div className="card mk-sell">
              <h3>Пусни обява за продажба</h3>
              <div className="mk-hold">
                <img src={thumb(p.cat, frameOf(p, ps.stage))} alt="" loading="lazy" decoding="async" />
                <div>
                  <span>Притежаваш</span>
                  <b>{ps.mine} {ps.mine === 1 ? 'токен' : 'токена'}</b>
                  <em>≈ {eur(ps.mine * fair)}</em>
                </div>
              </div>
              {free < 1 ? (
                <>
                  <p className="muted small">{ps.mine ? 'Всичките ти токени вече са обявени.' : 'Нямаш токени от този проект.'} Заяви покупка от обявите вляво или от първичния пазар.</p>
                  <Link className="btn ghost" href={'/project/' + p.id}>Към проекта</Link>
                </>
              ) : (
                <>
                  <label>Брой: <b>{qty}</b> от {free}</label>
                  <input type="range" min="1" max={free} value={Math.min(qty, free)} onChange={(e) => setQty(+e.target.value)} />
                  <label>Цена за токен</label>
                  <div className="mk-pricebtns">
                    {[[-0.02, '−2%'], [0, 'ориентир'], [0.02, '+2%'], [0.05, '+5%']].map(([d, t]) => {
                      const v = Math.round((fair * (1 + d)) / 5) * 5;
                      return <button key={t} className={price === v ? 'on' : ''} onClick={() => setPrice(v)}>{t}<br /><b>{eur(v)}</b></button>;
                    })}
                  </div>
                  <div className={'mk-chance ' + sellLevel[0]}><i />{sellLevel[1]}</div>
                  <table className="tbl">
                    <tbody>
                      <tr><td>Сума</td><td>{eur(qty * price)}</td></tr>
                      <tr><td>Такса на платформата (1%)</td><td>−{eur(qty * price * FEE.trade)}</td></tr>
                      <tr className="hl"><td>Получаваш</td><td>{eur(qty * price * (1 - FEE.trade))}</td></tr>
                    </tbody>
                  </table>
                  <button className="btn" onClick={() => { listMine(p.id, Math.min(qty, free), price); setMsg(price - fair <= near ? 'Обявата е публикувана. Търсим купувач…' : 'Обявата е публикувана. Цената е над ориентира и може да няма купувач.'); }}>
                    Пусни обява
                  </button>
                  {msg && <p className="ok small">{msg}</p>}
                </>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
