'use client';
import { useState } from 'react';
import { useStore } from '../providers';
import ProjectPicker, { usePicked } from '../../components/ProjectPicker';
import Link from 'next/link';
import { CATS, PROJECTS, getP, getC, fairValue, platformRevenue, target, last, eur } from '../../lib/data';

export default function Admin() {
  const { s, setStage, setProg, complete, release, approveKyc, addNews, reset, approveApp, rejectApp } = useStore();
  const [pid, setPid] = usePicked();
  const [news, setNews] = useState('');
  const p = getP(pid) || PROJECTS[0];
  const ps = s.proj[p.id];
  const L = last(p);
  const raisedAll = PROJECTS.reduce((a, x) => a + s.proj[x.id].sold * x.price, 0);
  const revAll = PROJECTS.reduce((a, x) => a + platformRevenue(x, s.proj[x.id]).total, 0);
  const rev = platformRevenue(p, ps);
  const raised = ps.sold * p.price;
  const relPct = p.tr.reduce((a, t, i) => a + (ps.released[i] ? t : 0), 0);
  const escrow = raised * (1 - relPct / 100);

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">Админ панел · оператор на платформата</div>
          <h1>Управление на проектите</h1>
          <p className="muted">Демо достъп без парола. Промените тук се виждат веднага в останалите страници.</p>
        </div>
        <button className="btn ghost" onClick={reset}>Нулирай демото</button>
      </section>

      <section className="kpis">
        <div className="card kpi"><span>Набрани общо</span><b className="gold">{eur(raisedAll)}</b></div>
        <div className="card kpi"><span>Проекти</span><b>{PROJECTS.length} <small>в {CATS.length} секции</small></b></div>
        <div className="card kpi"><span>Инвеститори с чакащ KYC</span><b>{s.investors.filter((x) => !x.kyc).length}</b></div>
        <div className="card kpi"><span>Приходи на платформата</span><b className="green">{eur(revAll)}</b></div>
      </section>

      <section className="card">
        <h3>Всички проекти</h3>
        <table className="tbl full click">
          <thead><tr><th>Проект</th><th>Секция</th><th>Токени</th><th>Набрани</th><th>Етап</th><th>Приход</th></tr></thead>
          <tbody>
            {PROJECTS.map((x) => {
              const xs = s.proj[x.id];
              return (
                <tr key={x.id} className={x.id === p.id ? 'hl' : ''} onClick={() => setPid(x.id)}>
                  <td>{x.name}</td>
                  <td>{getC(x.cat).icon} {getC(x.cat).name}</td>
                  <td>{xs.sold} / {x.tokens}</td>
                  <td>{eur(xs.sold * x.price)}</td>
                  <td>{x.stages[xs.stage].short}</td>
                  <td>{eur(platformRevenue(x, xs).total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="two" id="apps">
        <div className="card">
          <h3>Заявки за нови проекти</h3>
          <ul className="apps">
            {s.apps.map((a) => (
              <li key={a.id}>
                <div className="grow">
                  <b>{getC(a.cat).icon} {a.name}</b>
                  <span className="muted small">{a.company} · {a.loc} · {eur(a.amount)} · {a.ret}% · токен {eur(a.price)}</span>
                </div>
                {a.status === 'new' ? (
                  <>
                    <button className="btn ghost" onClick={() => rejectApp(a.id)}>Откажи</button>
                    <button className="btn sm" onClick={() => approveApp(a.id)}>Одобри и обяви</button>
                  </>
                ) : a.status === 'approved' ? (
                  <Link className="tag ok" href={'/project/' + a.pid}>обявен · отвори →</Link>
                ) : (
                  <span className="tag warn">отказан</span>
                )}
              </li>
            ))}
            {!s.apps.length && <li className="muted">Няма заявки.</li>}
          </ul>
          <p className="muted small">Одобрената заявка става проект в каталога със собствена страница, визуализация и пазар. Нови заявки идват от страницата <Link href="/owners">„За собственици“</Link>.</p>
        </div>
        <div className="card">
          <h3>Набрани средства по секции</h3>
          <div className="hbars">
            {CATS.map((c) => {
              const ps2 = PROJECTS.filter((x) => x.cat === c.slug);
              const got = ps2.reduce((a, x) => a + s.proj[x.id].sold * x.price, 0), goal = ps2.reduce((a, x) => a + target(x), 0);
              return (
                <div key={c.slug}>
                  <span>{c.icon} {c.name}</span>
                  <div className="bar"><i style={{ width: (got / goal) * 100 + '%' }} /></div>
                  <b>{eur(got)}</b>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ProjectPicker pid={p.id} setPid={setPid} />

      <section className="two">
        <div className="card">
          <h3>Етап · {p.name}</h3>
          <div className="stages">
            {p.stages.map((st, i) => (
              <button key={st.k} className={i === ps.stage ? 'on' : ''} onClick={() => (i === 1 && ps.stage === 0 ? complete(p.id) : setStage(p.id, i))}>
                <b>{i + 1}</b> {st.k}
              </button>
            ))}
          </div>
          <p className="muted small">Смяната на етапа сменя кадъра на проекта и ориентировъчната стойност на токена (сега {eur(fairValue(p, ps))}).</p>
          <label>{p.unit}: <b>{ps.prog}</b> / {p.N}</label>
          <input type="range" min="0" max={p.N} value={ps.prog} disabled={ps.stage !== L} onChange={(e) => setProg(p.id, +e.target.value)} />
          {ps.stage !== L && <p className="muted small">Активно на последния етап: „{p.stages[L].k}“.</p>}
        </div>
        <div className="card">
          <h3>Траншове от ескроу</h3>
          <table className="tbl full">
            <tbody>
              {p.tr.map((t, i) =>
                t ? (
                  <tr key={i}>
                    <td>Транш {i + 1} · {p.stages[i + 1].short}</td>
                    <td>{t}% · {eur((target(p) * t) / 100)}</td>
                    <td className="right">
                      {ps.released[i] ? <span className="tag ok">освободен</span> : <button className="btn sm" disabled={ps.stage < i + 1} onClick={() => release(p.id, i)}>Освободи</button>}
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
          <p className="muted small">В ескроу сметката: {eur(escrow)}. Транш се освобождава само след достигнат етап и независима проверка.</p>
        </div>
      </section>

      <section className="two">
        <div className="card">
          <h3>Инвеститори</h3>
          <table className="tbl full">
            <thead><tr><th>Име</th><th>Вложени</th><th>KYC</th><th /></tr></thead>
            <tbody>
              {s.investors.map((x, i) => (
                <tr key={x.n}>
                  <td>{x.n}</td>
                  <td>{eur(x.sum)}</td>
                  <td><span className={'tag ' + (x.kyc ? 'ok' : 'warn')}>{x.kyc ? 'потвърден' : 'чака проверка'}</span></td>
                  <td className="right">{!x.kyc && <button className="btn sm" onClick={() => approveKyc(i)}>Одобри</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Приходи от проекта</h3>
          <table className="tbl">
            <tbody>
              <tr><td>4% такса при успешно набиране</td><td>{eur(rev.raise)}</td></tr>
              <tr><td>{p.type === 'exit' ? '10% от печалбата на проекта' : '1% годишна такса за управление'}</td><td>{eur(rev.success)}</td></tr>
              <tr><td>1% от сделките на вторичния пазар</td><td>{eur(rev.trade)}</td></tr>
              <tr className="hl"><td>Общо</td><td>{eur(rev.total)}</td></tr>
            </tbody>
          </table>
          <p className="muted small">Таксите са примерен модел, а не пазарни данни.</p>
          <h3 style={{ marginTop: 22 }}>Публикувай новина за проекта</h3>
          <textarea rows="3" value={news} onChange={(e) => setNews(e.target.value)} placeholder="Напр. Достигнат е следващият етап." />
          <button className="btn sm" disabled={!news.trim()} onClick={() => { addNews(p.id, news.trim()); setNews(''); }}>Публикувай</button>
        </div>
      </section>
    </>
  );
}
