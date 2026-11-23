'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useStore } from '../providers';
import { PROJECTS, getP, getC, fairValue, paidPer, totalPer, last, eur } from '../../lib/data';

const Scene3D = dynamic(() => import('../../components/Scene3D'), { ssr: false });

export default function Profile() {
  const { s } = useStore();
  const rows = PROJECTS.filter((p) => s.proj[p.id].mine > 0).map((p) => {
    const ps = s.proj[p.id];
    const buys = s.tx.filter((t) => t.pid === p.id && t.t.startsWith('Покупка'));
    const bq = buys.reduce((a, t) => a + t.qty, 0);
    const avg = bq ? buys.reduce((a, t) => a + t.qty * t.price, 0) / bq : p.price;
    return { p, ps, avg, fair: fairValue(p, ps), value: ps.mine * fairValue(p, ps), cost: ps.mine * avg, paid: ps.mine * paidPer(p, ps), exp: ps.mine * totalPer(p) };
  });
  const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
  const [sel, setSel] = useState(null);
  const cur = rows.find((r) => r.p.id === sel) || rows[0];
  const bySector = {};
  rows.forEach((r) => (bySector[r.p.cat] = (bySector[r.p.cat] || 0) + r.value));

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">Профил на инвеститора</div>
          <h1>Здравей, Демо Инвеститор</h1>
          <p className="muted">Самоличност: <span className="tag ok">потвърдена (KYC)</span> · Тип: непрофесионален инвеститор</p>
        </div>
        <div className="card kpi"><span>Свободни средства</span><b>{eur(s.cash)}</b></div>
      </section>

      <section className="kpis">
        <div className="card kpi"><span>Проекти в портфейла</span><b>{rows.length} <small>от {PROJECTS.length}</small></b></div>
        <div className="card kpi"><span>Текуща стойност</span><b className="gold">{eur(sum('value'))}</b></div>
        <div className="card kpi">
          <span>Спрямо вложеното</span>
          <b className={sum('value') >= sum('cost') ? 'green' : 'red'}>{sum('value') >= sum('cost') ? '+' : ''}{eur(sum('value') - sum('cost'))}</b>
        </div>
        <div className="card kpi"><span>Получени плащания</span><b>{eur(sum('paid'))} <small>от {eur(sum('exp'))}</small></b></div>
      </section>

      {!rows.length ? (
        <section className="card center">
          <h2>Още нямаш токени</h2>
          <Link className="btn sm" href="/">Разгледай проектите</Link>
        </section>
      ) : (
        <>
          <section className="card">
            <h3>Моите инвестиции</h3>
            <table className="tbl full click">
              <thead>
                <tr><th>Проект</th><th>Секция</th><th>Токени</th><th>Средна цена</th><th>Стойност</th><th>Получени</th><th>Очаквани общо</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.p.id} className={cur.p.id === r.p.id ? 'hl' : ''} onClick={() => setSel(r.p.id)}>
                    <td>{r.p.name}</td>
                    <td>{getC(r.p.cat).icon} {getC(r.p.cat).name}</td>
                    <td>{r.ps.mine}</td>
                    <td>{eur(r.avg)}</td>
                    <td>{eur(r.value)}</td>
                    <td>{eur(r.paid)}</td>
                    <td>{eur(r.exp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="split">
              {Object.entries(bySector).map(([k, v]) => (
                <div key={k} style={{ flex: v }} title={getC(k).name}><span>{getC(k).icon} {Math.round((v / sum('value')) * 100)}%</span></div>
              ))}
            </div>
            <p className="muted small">Разпределение на портфейла по секции. Избери ред, за да видиш проекта отдолу.</p>
          </section>

          <section className="two wide-left">
            <div className="card">
              <h3>{cur.p.name}</h3>
              <Scene3D key={cur.p.scene} type={cur.p.scene} stage={cur.ps.stage} frac={cur.ps.prog / cur.p.N} height={400} />
              <p className="muted small">Етап: {cur.p.stages[cur.ps.stage].k}. {cur.p.unit}: {cur.ps.prog} от {cur.p.N}.</p>
            </div>
            <div className="card">
              <h3>Изплащания по проекта</h3>
              <div className="big gold">{eur(cur.paid)}</div>
              <p className="muted small">получени от общо очаквани {eur(cur.exp)}</p>
              <div className="bar"><i style={{ width: (cur.paid / cur.exp) * 100 + '%' }} /></div>
              <table className="tbl">
                <tbody>
                  <tr><td>Токени</td><td>{cur.ps.mine} от {cur.p.tokens}</td></tr>
                  <tr><td>Ориентировъчна стойност на токен</td><td>{eur(cur.fair)}</td></tr>
                  <tr><td>Дял от токените на проекта</td><td>{((cur.ps.mine / cur.p.tokens) * 100).toFixed(1)}%</td></tr>
                </tbody>
              </table>
              <div className="row">
                <Link className="btn sm" href={'/market?p=' + cur.p.id}>Продай на вторичния пазар</Link>
                <Link className="btn ghost" href={'/project/' + cur.p.id}>Към проекта</Link>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="two">
        <div className="card">
          <h3>История на операциите</h3>
          <table className="tbl full">
            <thead><tr><th>Дата</th><th>Проект</th><th>Операция</th><th>Брой</th><th>Цена</th></tr></thead>
            <tbody>
              {s.tx.map((t, i) => (
                <tr key={i}><td>{t.d}</td><td>{getP(t.pid).name}</td><td>{t.t}</td><td>{t.qty}</td><td>{eur(t.price)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Предстоящи плащания</h3>
          <ul className="news">
            {rows.map((r) => {
              const L = last(r.p), op = r.ps.stage === L, fin = op && r.ps.prog >= r.p.N;
              const txt = fin ? 'Проектът е изплатен изцяло.' : r.p.type === 'income'
                ? (op ? 'Следващо тримесечие: ' + eur((r.ps.mine * r.p.price * r.p.yld) / 4) : 'По ' + eur((r.ps.mine * r.p.price * r.p.yld) / 4) + ' на тримесечие след етап „' + r.p.stages[L].short + '“')
                : (op ? 'Следваща вълна продажби: ' + eur((r.ps.mine * r.p.payout) / r.p.N) : 'До ' + eur(r.ps.mine * r.p.payout) + ' при продажбата, около месец ' + r.p.months);
              return <li key={r.p.id}><span>{getC(r.p.cat).icon}</span><span className="grow"><b>{r.p.name}</b><br />{txt}</span></li>;
            })}
            {!rows.length && <li className="muted">Няма очаквани плащания.</li>}
          </ul>
          <h3 style={{ marginTop: 20 }}>Документи</h3>
          <ul className="docs">
            {['Основен информационен документ (KIIS)', 'Договор за инвестиция', 'Сертификат за дял', 'Независима оценка на проекта', 'Тримесечен отчет'].map((d) => (
              <li key={d}><span>📄</span>{d}<em>демо</em></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
