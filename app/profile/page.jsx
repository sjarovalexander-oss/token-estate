'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../providers';
import { Count, Donut } from '../../components/Bits';
import StageView from '../../components/StageView';
import { PROJECTS, getP, getC, fairValue, paidPer, totalPer, still, thumb, last, eur } from '../../lib/data';

const frameOf = (p, st) => (p.frames ? p.frames[st] : Math.min(st, 3));
const NQ = 12; // следващите 12 тримесечия

// Какво ще получи инвеститорът през следващите тримесечия (илюстрация)
function upcoming(p, ps) {
  const out = Array(NQ).fill(0);
  const L = last(p);
  const left = p.N - (ps.stage === L ? ps.prog : 0);
  if (left <= 0) return out;
  if (p.type === 'income') {
    const per = (ps.mine * p.price * p.yld) / 4;
    const startQ = ps.stage === L ? 0 : Math.max(1, Math.ceil((p.stages[L].month - p.stages[ps.stage].month) / 3));
    for (let k = 0; k < left && startQ + k < NQ; k++) out[startQ + k] += per + (k === left - 1 ? ps.mine * p.price : 0);
  } else {
    const startQ = ps.stage === L ? 0 : Math.max(1, Math.ceil((p.months - p.stages[ps.stage].month) / 3));
    const waves = Math.min(4, left);
    for (let k = 0; k < waves && startQ + k < NQ; k++) out[startQ + k] += (ps.mine * p.payout * (left / p.N)) / waves;
  }
  return out;
}

export default function Profile() {
  const { s } = useStore();
  const rows = PROJECTS.filter((p) => s.proj[p.id].mine > 0).map((p) => {
    const ps = s.proj[p.id];
    const buys = s.tx.filter((t) => t.pid === p.id && t.t.startsWith('Покупка'));
    const bq = buys.reduce((a, t) => a + t.qty, 0);
    const avg = bq ? buys.reduce((a, t) => a + t.qty * t.price, 0) / bq : p.price;
    const fair = fairValue(p, ps);
    return { p, ps, avg, fair, value: ps.mine * fair, cost: ps.mine * avg, paid: ps.mine * paidPer(p, ps), exp: ps.mine * totalPer(p), up: upcoming(p, ps) };
  });
  const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
  const [sel, setSel] = useState(null);
  const [hq, setHq] = useState(null);
  const cur = rows.find((r) => r.p.id === sel) || rows[0];
  const bySector = {};
  rows.forEach((r) => (bySector[getC(r.p.cat).name] = (bySector[getC(r.p.cat).name] || 0) + r.value));
  const flow = Array.from({ length: NQ }, (_, k) => rows.reduce((a, r) => a + r.up[k], 0));
  const maxF = Math.max(1, ...flow);
  const gain = sum('value') - sum('cost');
  const qLabel = (k) => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3 * (k + 1));
    return 'Q' + (Math.floor(d.getMonth() / 3) + 1) + " '" + String(d.getFullYear()).slice(2);
  };
  const heroRows = rows.length ? rows : PROJECTS.slice(0, 3).map((p) => ({ p, ps: s.proj[p.id] }));

  return (
    <>
      <section className="pr-hero">
        <div className="pr-collage" style={{ gridTemplateColumns: `repeat(${heroRows.length}, 1fr)` }}>
          {heroRows.map((r) => <img key={r.p.id} src={still(r.p.cat, frameOf(r.p, r.ps.stage))} alt="" />)}
        </div>
        <div className="pr-hero-shade" />
        <div className="pr-hero-txt">
          <div className="pr-avatar">ДИ</div>
          <div>
            <div className="eyebrow">Профил на инвеститора</div>
            <h1>Здравей, Демо Инвеститор</h1>
            <p className="muted"><span className="tag ok">✓ KYC потвърден</span> · непрофесионален инвеститор</p>
          </div>
        </div>
        <div className="pr-total card">
          <span>Стойност на портфейла</span>
          <b><Count to={sum('value')} fmt={eur} /></b>
          <em className={gain >= 0 ? 'green' : 'red'}>{gain >= 0 ? '▲ +' : '▼ '}{eur(gain)} спрямо вложеното</em>
          <div className="mk-mini">
            <div><span>Свободни</span><b>{eur(s.cash)}</b></div>
            <div><span>Получени</span><b className="green">{eur(sum('paid'))}</b></div>
            <div><span>Проекти</span><b>{rows.length}</b></div>
          </div>
        </div>
      </section>

      {!rows.length ? (
        <section className="card center">
          <h2>Още нямаш токени</h2>
          <p className="muted">Сглоби портфейл за една минута или избери проект.</p>
          <div className="row center"><Link className="btn sm" href="/portfolio">Сглоби портфейл</Link><Link className="btn ghost" href="/">Към проектите</Link></div>
        </section>
      ) : (
        <>
          <section className="pr-sec">
            <div className="mk-head"><h3 className="sec-h">Моите инвестиции</h3><span className="muted small">избери карта, за да я видиш отблизо</span></div>
            <div className="pr-cards">
              {rows.map((r) => {
                const g = r.value - r.cost;
                return (
                  <button key={r.p.id} className={'pr-card' + (cur.p.id === r.p.id ? ' on' : '')} onClick={() => setSel(r.p.id)}>
                    <img src={thumb(r.p.cat, frameOf(r.p, r.ps.stage))} alt="" loading="lazy" decoding="async" />
                    <div className="pr-card-shade" />
                    <div className="pr-card-top"><span>{getC(r.p.cat).icon} {getC(r.p.cat).name}</span><span className="sv-chip"><i /> {r.p.stages[r.ps.stage].short}</span></div>
                    <div className="pr-card-body">
                      <b className="pr-name">{r.p.name}</b>
                      <div className="pr-nums">
                        <div><span>Токени</span><b>{r.ps.mine}</b></div>
                        <div><span>Стойност</span><b>{eur(r.value)}</b></div>
                        <div><span>Промяна</span><b className={g >= 0 ? 'green' : 'red'}>{g >= 0 ? '+' : ''}{eur(g)}</b></div>
                      </div>
                      <div className="bar"><i style={{ width: (r.paid / r.exp) * 100 + '%' }} /></div>
                      <span className="pr-paid">получени {eur(r.paid)} от {eur(r.exp)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="two wide-left">
            <div className="card">
              <div className="pf-flow-head">
                <div>
                  <h3>Предстоящи плащания</h3>
                  <p className="muted small">Колко очакваш да получиш през следващите 3 години, по тримесечия. Посочи стълб.</p>
                </div>
                <div className="pf-flow-info">
                  {hq !== null ? (
                    <><span>{qLabel(hq)}</span><b>{eur(flow[hq])}</b><em>{rows.filter((r) => r.up[hq] > 0).map((r) => r.p.name.split(' „')[0]).join(', ') || 'няма плащания'}</em></>
                  ) : (
                    <><span>Следващите 3 години</span><b>{eur(flow.reduce((a, b) => a + b, 0))}</b><em>очаквани плащания</em></>
                  )}
                </div>
              </div>
              <div className="pf-flow" onMouseLeave={() => setHq(null)}>
                {flow.map((v, k) => (
                  <div key={k} className={'pf-q' + (hq === k ? ' hv' : '')} onMouseEnter={() => setHq(k)} onClick={() => setHq(k)}>
                    <div className="pf-q-col"><i className={v > maxF * 0.5 ? 'ex' : 'in'} style={{ height: (v / maxF) * 100 + '%' }} /></div>
                    {k % 2 === 0 && <span>{qLabel(k)}</span>}
                  </div>
                ))}
              </div>
              <p className="muted small">Прогноза по плана на всеки проект. Високите златни стълбове включват връщане на вложената сума. Илюстрация, не обещание.</p>
            </div>
            <div className="card">
              <h3>Разпределение</h3>
              <Donut parts={Object.entries(bySector).map(([k, v]) => ({ k, v }))} />
              <div className="row">
                <Link className="btn sm" href="/portfolio">Добави още</Link>
                <Link className="btn ghost" href="/market">Към пазара</Link>
              </div>
            </div>
          </section>

          <section className="two wide-left">
            <div className="card">
              <div className="mk-head"><h3>{cur.p.name}</h3><Link className="small" href={'/project/' + cur.p.id}>страницата на проекта →</Link></div>
              <StageView key={cur.p.id} p={cur.p} stage={cur.ps.stage} height={380} />
            </div>
            <div className="card">
              <h3>Детайли</h3>
              <table className="tbl">
                <tbody>
                  <tr><td>Токени</td><td>{cur.ps.mine} от {cur.p.tokens}</td></tr>
                  <tr><td>Средна цена на покупка</td><td>{eur(cur.avg)}</td></tr>
                  <tr><td>Ориентировъчна стойност</td><td>{eur(cur.fair)}</td></tr>
                  <tr><td>Получени плащания</td><td className="green">{eur(cur.paid)}</td></tr>
                  <tr><td>Очаквано общо</td><td>{eur(cur.exp)}</td></tr>
                  <tr><td>{cur.p.unit}</td><td>{cur.ps.prog} / {cur.p.N}</td></tr>
                </tbody>
              </table>
              <div className="row">
                <Link className="btn sm" href={'/market?p=' + cur.p.id}>Продай на пазара</Link>
                <button className="btn ghost">Сертификат (PDF)</button>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="two">
        <div className="card">
          <h3>История</h3>
          <ul className="pr-list">
            {s.tx.map((t, i) => {
              const p = getP(t.pid);
              const sell = t.t.startsWith('Продажба');
              return (
                <li key={i}>
                  {p ? <img src={thumb(p.cat, frameOf(p, s.proj[p.id].stage))} alt="" loading="lazy" decoding="async" /> : <span className="pr-ic">•</span>}
                  <div className="grow"><b>{p ? p.name : t.pid}</b><span className="muted">{t.d} · {t.t} · {t.qty} бр.</span></div>
                  <b className={sell ? 'green' : ''}>{sell ? '+' : '−'}{eur(t.qty * t.price)}</b>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="card">
          <h3>Документи</h3>
          <ul className="pr-list">
            {[['📄', 'Основен информационен документ (KIIS)', 'PDF · 4 стр.'], ['✍️', 'Договор за инвестиция', 'подписан електронно'], ['🏅', 'Сертификати за дял', rows.length + ' бр.'], ['📊', 'Тримесечен отчет', 'последно тримесечие'], ['🧾', 'Данъчна справка за годината', 'готова през януари']].map(([ic, t, m]) => (
              <li key={t}><span className="pr-ic">{ic}</span><div className="grow"><b>{t}</b><span className="muted">{m}</span></div><em className="tag">демо</em></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
