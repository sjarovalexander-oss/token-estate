'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../providers';
import { Donut } from '../../components/Bits';
import { CATS, PROJECTS, PROFILES, DEPOSIT, getC, annual, isOpen, eur, retLabel, termLabel } from '../../lib/data';

export default function Portfolio() {
  const { s, buyMany } = useStore();
  const [amount, setAmount] = useState(20000);
  const [pk, setPk] = useState('bal');
  const [done, setDone] = useState(false);
  const [sort, setSort] = useState('annual');
  const prof = PROFILES.find((x) => x.k === pk);

  const plan = useMemo(() => {
    const rows = [];
    CATS.forEach((c) => {
      const w = prof.w[c.slug] || 0;
      const p = PROJECTS.find((x) => x.cat === c.slug && isOpen(x, s.proj[x.id]));
      if (!w || !p) return;
      const q = Math.min(Math.floor((amount * w) / 100 / p.price), p.tokens - s.proj[p.id].sold);
      if (q > 0) rows.push({ p, c, q, sum: q * p.price, r: annual(p) });
    });
    const inv = rows.reduce((a, r) => a + r.sum, 0);
    const rate = inv ? rows.reduce((a, r) => a + r.sum * r.r, 0) / inv : 0;
    return { rows, inv, rate, left: amount - inv };
  }, [amount, prof, s.proj]);

  const yrs = [1, 2, 3, 4, 5];
  const maxV = amount * (1 + Math.max(plan.rate, DEPOSIT) * 5);
  const table = [...PROJECTS].sort((a, b) =>
    sort === 'annual' ? annual(b) - annual(a) : sort === 'price' ? a.price - b.price : sort === 'term' ? (a.months || a.years * 12) - (b.months || b.years * 12) : s.proj[b.id].sold / b.tokens - s.proj[a.id].sold / a.tokens
  );

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">Инструмент за инвеститора</div>
          <h1>Сглоби портфейл за една минута</h1>
          <p className="muted">Избери сума и профил. Платформата разпределя парите между секциите и показва какво да очакваш.</p>
        </div>
        <div className="card kpi"><span>Свободни средства</span><b>{eur(s.cash)}</b></div>
      </section>

      <section className="two wide-left">
        <div className="card">
          <label>Сума за инвестиране: <b>{eur(amount)}</b></label>
          <input type="range" min="1000" max="100000" step="500" value={amount} onChange={(e) => { setAmount(+e.target.value); setDone(false); }} />
          <div className="seg big3">
            {PROFILES.map((x) => (
              <button key={x.k} className={pk === x.k ? 'on' : ''} onClick={() => { setPk(x.k); setDone(false); }}>{x.name}</button>
            ))}
          </div>
          <p className="muted small">{prof.note}</p>
          <table className="tbl full">
            <thead><tr><th>Проект</th><th>Токени</th><th>Сума</th><th>≈ годишно</th><th>Доход на година</th></tr></thead>
            <tbody>
              {plan.rows.map((r) => (
                <tr key={r.p.id}>
                  <td><Link href={'/project/' + r.p.id}>{r.c.icon} {r.p.name}</Link></td>
                  <td>{r.q}</td>
                  <td>{eur(r.sum)}</td>
                  <td>{(r.r * 100).toFixed(1)}%</td>
                  <td className="green">+{eur(r.sum * r.r)}</td>
                </tr>
              ))}
              {!plan.rows.length && <tr><td colSpan="5" className="muted">Сумата е малка за този профил или няма отворени проекти. Увеличи сумата.</td></tr>}
              <tr className="hl"><td>Общо</td><td /><td>{eur(plan.inv)}</td><td>{(plan.rate * 100).toFixed(1)}%</td><td>+{eur(plan.inv * plan.rate)}</td></tr>
            </tbody>
          </table>
          <p className="muted small">Остават неинвестирани {eur(plan.left)}, защото токените се купуват цели.</p>
          {done ? (
            <p className="ok">✓ Портфейлът е купен. <Link href="/profile">Виж го в профила си →</Link></p>
          ) : (
            <button className="btn" disabled={!plan.inv || plan.inv > s.cash} onClick={() => { buyMany(plan.rows.map((r) => ({ pid: r.p.id, q: r.q }))); setDone(true); }}>
              {plan.inv > s.cash ? 'Недостатъчни средства в демо портфейла' : 'Купи целия портфейл за ' + eur(plan.inv)}
            </button>
          )}
        </div>
        <div className="card">
          <h3>Разпределение по секции</h3>
          <Donut parts={plan.rows.map((r) => ({ k: r.c.name, v: r.sum }))} />
          <h3 style={{ marginTop: 22 }}>След 5 години</h3>
          <div className="bars">
            {yrs.map((y) => {
              const a = plan.inv * (1 + plan.rate * y), b = plan.inv * (1 + DEPOSIT * y);
              return (
                <div key={y} className="bar2">
                  <div className="cols">
                    <i className="a" style={{ height: (a / maxV) * 100 + '%' }} title={eur(a)} />
                    <i className="b" style={{ height: (b / maxV) * 100 + '%' }} title={eur(b)} />
                  </div>
                  <span>г. {y}</span>
                </div>
              );
            })}
          </div>
          <div className="legend">
            <span><i className="sold" /> портфейл: {eur(plan.inv * (1 + plan.rate * 5))}</span>
            <span><i className="free" /> депозит 2%: {eur(plan.inv * (1 + DEPOSIT * 5))}</span>
          </div>
          <p className="muted small">Проста сметка без реинвестиране и без данъци. Депозитът от 2% е примерно допускане за сравнение. Депозитът е гарантиран, инвестициите тук не са.</p>
        </div>
      </section>

      <section className="card">
        <h3>Сравни всички проекти</h3>
        <div className="seg">
          {[['annual', 'По доходност'], ['price', 'По цена на токен'], ['term', 'По срок'], ['sold', 'По набрани']].map(([k, t]) => (
            <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}>{t}</button>
          ))}
        </div>
        <table className="tbl full">
          <thead><tr><th>Проект</th><th>Секция</th><th>Токен</th><th>Доходност</th><th>≈ годишно</th><th>Срок</th><th>Изплащане</th><th>Набрани</th><th /></tr></thead>
          <tbody>
            {table.map((p) => {
              const ps = s.proj[p.id];
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{getC(p.cat).icon} {getC(p.cat).name}</td>
                  <td>{eur(p.price)}</td>
                  <td>{retLabel(p)}</td>
                  <td className="gold">{(annual(p) * 100).toFixed(1)}%</td>
                  <td>{termLabel(p)}</td>
                  <td>{p.type === 'exit' ? 'накрая' : 'на тримесечие'}</td>
                  <td>{Math.round((ps.sold / p.tokens) * 100)}%</td>
                  <td className="right"><Link className="btn sm" href={'/project/' + p.id}>Отвори</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="muted small">Всички доходности са прогнозни и измислени за демото.</p>
      </section>
    </>
  );
}
