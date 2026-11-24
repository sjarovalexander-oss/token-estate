'use client';
import { EnNote } from '../../lib/brand';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../providers';
import { Count } from '../../components/Bits';
import { CATS, PROJECTS, PROFILES, DEPOSIT, STILLS, still, thumb, getC, annual, isOpen, last, eur, retLabel, termLabel } from '../../lib/data';

// Риск по секции (1 = най-нисък, 5 = най-висок) — илюстрация за демото
const RISK = { zemia: 1, naem: 2, energia: 2, hoteli: 3, stroitelstvo: 4, remont: 5 };
const PROF_META = {
  cons: { icon: '', tag: 'Спокойно', still: 'zemia' },
  bal: { icon: '', tag: 'Баланс', still: 'naem' },
  dyn: { icon: '', tag: 'Растеж', still: 'stroitelstvo' },
  custom: { icon: '', tag: 'Мое', still: 'hoteli' },
};
const QUICK = [5000, 10000, 25000, 50000, 100000];
const Q = 20; // хоризонт: 5 години = 20 тримесечия

function Risk({ v }) {
  return <span className="riskdots">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= v ? 'on' : ''} />)}</span>;
}

export default function Portfolio() {
  const { s, buyMany } = useStore();
  const [amount, setAmount] = useState(20000);
  const [pk, setPk] = useState('bal');
  const [w, setW] = useState({ ...PROFILES[1].w });
  const [done, setDone] = useState(false);
  const [sort, setSort] = useState('annual');
  const [hover, setHover] = useState(null);

  const pick = (k) => {
    setPk(k);
    if (k !== 'custom') setW({ ...PROFILES.find((x) => x.k === k).w });
    setDone(false);
  };
  const nudge = (slug, d) => {
    setPk('custom');
    setDone(false);
    setW((x) => ({ ...x, [slug]: Math.max(0, Math.min(100, (x[slug] || 0) + d)) }));
  };
  const totalW = CATS.reduce((a, c) => a + (w[c.slug] || 0), 0) || 1;

  const plan = useMemo(() => {
    const rows = [];
    CATS.forEach((c) => {
      const share = (w[c.slug] || 0) / totalW;
      const p = PROJECTS.find((x) => x.cat === c.slug && isOpen(x, s.proj[x.id])) || PROJECTS.find((x) => x.cat === c.slug);
      const open = isOpen(p, s.proj[p.id]);
      const q = open ? Math.min(Math.floor((amount * share) / p.price), p.tokens - s.proj[p.id].sold) : 0;
      rows.push({ p, c, q, share, sum: q * p.price, r: annual(p), open });
    });
    const act = rows.filter((r) => r.q > 0);
    const inv = act.reduce((a, r) => a + r.sum, 0);
    const rate = inv ? act.reduce((a, r) => a + r.sum * r.r, 0) / inv : 0;
    const risk = inv ? act.reduce((a, r) => a + r.sum * RISK[r.c.slug], 0) / inv : 0;
    // паричен поток по тримесечия: доход на тримесечие или изплащане накрая
    const flow = Array.from({ length: Q }, () => ({ inc: 0, exit: 0 }));
    let still5 = 0; // главница, която още не е върната след 5 години
    act.forEach(({ p, q }) => {
      const startQ = Math.ceil(p.stages[last(p)].month / 3);
      if (p.type === 'income') {
        for (let k = startQ; k < Math.min(Q, startQ + p.years * 4); k++) flow[k].inc += (q * p.price * p.yld) / 4;
        if (startQ + p.years * 4 <= Q) flow[Math.min(Q - 1, startQ + p.years * 4 - 1)].exit += q * p.price;
        else still5 += q * p.price;
      } else {
        const k = Math.min(Q - 1, Math.ceil(p.months / 3));
        flow[k].exit += q * p.payout;
      }
    });
    const got5 = flow.reduce((a, f) => a + f.inc + f.exit, 0);
    return { rows, act, inv, rate, risk, flow, got5, still5, value5: got5 + still5, left: amount - inv, yearly: inv * rate };
  }, [amount, w, totalW, s.proj]);

  const maxF = Math.max(1, ...plan.flow.map((f) => f.inc + f.exit));
  const hv = hover !== null ? plan.flow[hover] : null;
  const cum = (k) => plan.flow.slice(0, k + 1).reduce((a, f) => a + f.inc + f.exit, 0);
  const table = [...PROJECTS].sort((a, b) =>
    sort === 'annual' ? annual(b) - annual(a) : sort === 'price' ? a.price - b.price : sort === 'term' ? (a.months || a.years * 12) - (b.months || b.years * 12) : s.proj[b.id].sold / b.tokens - s.proj[a.id].sold / a.tokens
  );
  const cards = [...PROFILES, { k: 'custom', name: 'Свой', note: 'Нагласи сам дяловете на всяка секция с бутоните по-долу.' }];

  return (
    <>
      <EnNote />
      <section className="pf-hero">
        <div className="pf-collage">
          {CATS.map((c, i) => (
            <img key={c.slug} src={thumb(c.slug, STILLS[c.slug] - 1)} alt="" loading="lazy" decoding="async" style={{ animationDelay: i * 0.12 + 's' }} />
          ))}
        </div>
        <div className="pf-hero-txt">
          <div className="eyebrow">Инструмент за инвеститора</div>
          <h1>Сглоби портфейл за една минута</h1>
          <p className="lead">Избери сума и стил. Платформата разпределя парите между шестте секции и показва точно кога и колко получаваш.</p>
        </div>
      </section>

      <section className="card pf-step">
        <div className="pf-num">01</div>
        <div className="grow">
          <h3>Колко искаш да вложиш?</h3>
          <div className="pf-amount"><Count to={amount} fmt={eur} /></div>
          <input type="range" min="1000" max="100000" step="500" value={amount} onChange={(e) => { setAmount(+e.target.value); setDone(false); }} />
          <div className="seg">
            {QUICK.map((v) => <button key={v} className={amount === v ? 'on' : ''} onClick={() => { setAmount(v); setDone(false); }}>{eur(v)}</button>)}
          </div>
        </div>
      </section>

      <section className="pf-step2">
        <div className="pf-num">02</div>
        <h3>Избери стил</h3>
        <div className="pf-profiles">
          {cards.map((x) => {
            const m = PROF_META[x.k];
            const ww = x.k === 'custom' ? w : x.w;
            const tw = CATS.reduce((a, c) => a + (ww[c.slug] || 0), 0) || 1;
            const rate = CATS.reduce((a, c) => a + ((ww[c.slug] || 0) / tw) * annual(PROJECTS.find((p) => p.cat === c.slug)), 0);
            const risk = CATS.reduce((a, c) => a + ((ww[c.slug] || 0) / tw) * RISK[c.slug], 0);
            return (
              <button key={x.k} className={'pf-prof' + (pk === x.k ? ' on' : '')} onClick={() => pick(x.k)}>
                <img src={thumb(m.still, STILLS[m.still] - 1)} alt="" loading="lazy" decoding="async" />
                <div className="pf-prof-body">
                  <span className="pf-tag">{m.tag}</span>
                  <b>{x.name}</b>
                  <p>{x.note}</p>
                  <div className="pf-prof-nums">
                    <span>≈ <b className="gold">{(rate * 100).toFixed(1)}%</b> годишно</span>
                    <span>риск <Risk v={Math.round(risk)} /></span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="pf-step2">
        <div className="pf-num">03</div>
        <h3>Твоят портфейл</h3>
        <div className="pf-alloc">
          {plan.rows.map((r) => (
            <div key={r.c.slug} className={'pf-sec' + (r.q > 0 ? '' : ' off')}>
              <img src={thumb(r.c.slug, STILLS[r.c.slug] - 1)} alt="" loading="lazy" decoding="async" />
              <div className="pf-sec-shade" />
              <div className="pf-sec-top">
                <span>{r.c.name}</span>
                <Risk v={RISK[r.c.slug]} />
              </div>
              <div className="pf-sec-body">
                <div className="pf-share"><b>{Math.round(r.share * 100)}%</b><span>{r.q > 0 ? eur(r.sum) : !r.open ? 'набран изцяло' : r.share > 0 ? 'мин. ' + eur(r.p.price) + ' за 1 токен' : 'не е избрана'}</span></div>
                <div className="bar"><i style={{ width: r.share * 100 + '%' }} /></div>
                <div className="pf-sec-foot">
                  <Link href={'/project/' + r.p.id}>{r.p.name}</Link>
                  <span>{r.q} × {eur(r.p.price)} · <b className="gold">{retLabel(r.p)}</b></span>
                </div>
                <div className="pf-nudge">
                  <button onClick={() => nudge(r.c.slug, -5)} aria-label="по-малко">−</button>
                  <button onClick={() => nudge(r.c.slug, 5)} aria-label="повече">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="muted small">Токените се купуват цели, затова остават неинвестирани {eur(plan.left)}. Бутоните + и − нагласят дела на секцията ръчно.</p>
      </section>

      <section className="pf-kpis">
        <div className="card kpi"><span>Влагаш</span><b><Count to={plan.inv} fmt={eur} /></b></div>
        <div className="card kpi"><span>Очакван доход на година</span><b className="green">+<Count to={plan.yearly} fmt={eur} /></b></div>
        <div className="card kpi"><span>Стойност след 5 години</span><b className="gold"><Count to={plan.value5} fmt={eur} /></b><em className="kpi-sub">{eur(plan.got5)} изплатени + {eur(plan.still5)} в проекти</em></div>
        <div className="card kpi"><span>Среден риск</span><b><Risk v={Math.round(plan.risk)} /> <small>{plan.risk ? plan.risk.toFixed(1) : '–'} / 5</small></b></div>
      </section>

      <section className="card">
        <div className="pf-flow-head">
          <div>
            <h3>Кога и колко получаваш</h3>
            <p className="muted small">Всеки стълб е едно тримесечие. Зелено е редовният доход, златно е изплащането накрая. Посочи стълб за подробности.</p>
          </div>
          <div className="pf-flow-info">
            {hv ? (
              <>
                <span>Тримесечие {hover + 1} · година {Math.floor(hover / 4) + 1}</span>
                <b>{eur(hv.inc + hv.exit)}</b>
                <em>натрупано: {eur(cum(hover))}</em>
              </>
            ) : (
              <>
                <span>Изплатени за 5 години</span>
                <b>{eur(plan.got5)}</b>
                <em>още {eur(plan.still5)} в проекти, които продължават</em>
              </>
            )}
          </div>
        </div>
        <div className="pf-flow" onMouseLeave={() => setHover(null)}>
          {plan.flow.map((f, k) => (
            <div key={k} className={'pf-q' + (hover === k ? ' hv' : '')} onMouseEnter={() => setHover(k)} onClick={() => setHover(k)}>
              <div className="pf-q-col">
                <i className="ex" style={{ height: (f.exit / maxF) * 100 + '%' }} />
                <i className="in" style={{ height: (f.inc / maxF) * 100 + '%' }} />
              </div>
              {k % 4 === 0 && <span>г. {k / 4 + 1}</span>}
            </div>
          ))}
        </div>
        <div className="legend">
          <span><i className="lg-in" /> доход на тримесечие</span>
          <span><i className="lg-ex" /> изплащане накрая (главница + печалба)</span>
        </div>
        <p className="muted small">
          Сравнение: същата сума в депозит с 2% (примерно допускане) носи {eur(plan.inv * DEPOSIT * 5)} лихва за 5 години. Проектите с доход на тримесечие връщат вложената сума в края на своя срок; ако той е след петата година, сумата се води „в проекти“. Всичко е илюстрация по прогнозните доходности на демото, не обещание.
        </p>
      </section>

      <section className="pf-buy card">
        <div>
          <h3>Готов ли си?</h3>
          <p className="muted small">Купуваш токени от {plan.act.length} {plan.act.length === 1 ? 'проект' : 'проекта'} наведнъж. Парите отиват в ескроу сметка до успешното набиране на всеки проект.</p>
        </div>
        {done ? (
          <p className="ok">✓ Портфейлът е купен. <Link href="/profile">Виж го в профила си →</Link></p>
        ) : (
          <button className="btn" disabled={!plan.inv || plan.inv > s.cash} onClick={() => { buyMany(plan.act.map((r) => ({ pid: r.p.id, q: r.q }))); setDone(true); }}>
            {plan.inv > s.cash ? 'Недостатъчни средства в демо портфейла' : 'Купи целия портфейл за ' + eur(plan.inv)}
          </button>
        )}
      </section>

      <section className="card">
        <h3>Сравни всички проекти</h3>
        <div className="seg">
          {[['annual', 'По доходност'], ['price', 'По цена на токен'], ['term', 'По срок'], ['sold', 'По набрани']].map(([k, t]) => (
            <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}>{t}</button>
          ))}
        </div>
        <table className="tbl full">
          <thead><tr><th>Проект</th><th>Секция</th><th>Риск</th><th>Токен</th><th>Доходност</th><th>≈ годишно</th><th>Срок</th><th>Набрани</th><th /></tr></thead>
          <tbody>
            {table.map((p) => {
              const ps = s.proj[p.id];
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{getC(p.cat).name}</td>
                  <td><Risk v={RISK[p.cat]} /></td>
                  <td>{eur(p.price)}</td>
                  <td>{retLabel(p)}</td>
                  <td className="gold">{(annual(p) * 100).toFixed(1)}%</td>
                  <td>{termLabel(p)}</td>
                  <td>{Math.round((ps.sold / p.tokens) * 100)}%</td>
                  <td className="right"><Link className="btn sm" href={'/project/' + p.id}>Отвори</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="muted small">Доходностите и нивата на риск са прогнозни и измислени за демото.</p>
      </section>
    </>
  );
}
