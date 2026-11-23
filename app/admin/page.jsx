'use client';
import { EnNote } from '../../lib/brand';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../providers';
import { usePicked } from '../../components/ProjectPicker';
import StageView from '../../components/StageView';
import { Count } from '../../components/Bits';
import { CATS, PROJECTS, getP, getC, fairValue, platformRevenue, target, last, still, thumb, STILLS, eur } from '../../lib/data';

const frameOf = (p, st) => (p.frames ? p.frames[st] : Math.min(st, 3));

export default function Admin() {
  const { s, setStage, setProg, complete, release, approveKyc, addNews, reset, approveApp, rejectApp } = useStore();
  const [pid, setPid] = usePicked();
  const [news, setNews] = useState('');
  const [tab, setTab] = useState('stage');
  const p = getP(pid) || PROJECTS[0];
  const ps = s.proj[p.id];
  const L = last(p);
  const raisedAll = PROJECTS.reduce((a, x) => a + s.proj[x.id].sold * x.price, 0);
  const goalAll = PROJECTS.reduce((a, x) => a + target(x), 0);
  const revs = PROJECTS.map((x) => ({ x, r: platformRevenue(x, s.proj[x.id]) }));
  const revAll = revs.reduce((a, y) => a + y.r.total, 0);
  const maxRev = Math.max(1, ...revs.map((y) => y.r.total));
  const rev = platformRevenue(p, ps);
  const raised = ps.sold * p.price;
  const relPct = p.tr.reduce((a, t, i) => a + (ps.released[i] ? t : 0), 0);
  const escrow = raised * (1 - relPct / 100);
  const pending = s.apps.filter((a) => a.status === 'new');
  const kycWait = s.investors.filter((x) => !x.kyc).length;

  return (
    <>
      <EnNote />
      <section className="ad-head">
        <div>
          <div className="eyebrow">Админ панел · оператор на платформата</div>
          <h1>Контролен център</h1>
          <p className="muted">Демо достъп без парола. Всяка промяна тук се вижда веднага в сайта.</p>
        </div>
        <div className="row">
          {pending.length > 0 && <a className="ad-alert" href="#apps">🔔 {pending.length} {pending.length === 1 ? 'нова заявка' : 'нови заявки'}</a>}
          {kycWait > 0 && <a className="ad-alert warn" href="#kyc">🪪 {kycWait} чакат KYC</a>}
          <button className="btn ghost" onClick={reset}>Нулирай демото</button>
        </div>
      </section>

      <section className="pf-kpis">
        <div className="card kpi"><span>Набрани общо</span><b className="gold"><Count to={raisedAll} fmt={eur} /></b><em className="kpi-sub">{Math.round((raisedAll / goalAll) * 100)}% от целта {eur(goalAll)}</em></div>
        <div className="card kpi"><span>Приходи на платформата</span><b className="green"><Count to={revAll} fmt={eur} /></b><em className="kpi-sub">такси при набиране, успех и пазар</em></div>
        <div className="card kpi"><span>Проекти</span><b>{PROJECTS.length}</b><em className="kpi-sub">{PROJECTS.filter((x) => s.proj[x.id].stage > 0).length} работят · {PROJECTS.filter((x) => s.proj[x.id].stage === 0).length} набират</em></div>
        <div className="card kpi"><span>Инвеститори</span><b>{s.investors.length + 1}</b><em className="kpi-sub">{kycWait} чакат проверка</em></div>
      </section>

      <section>
        <div className="mk-head"><h3 className="sec-h">Проекти</h3><span className="muted small">избери проект, за да го управляваш</span></div>
        <div className="ad-grid">
          {PROJECTS.map((x) => {
            const xs = s.proj[x.id];
            return (
              <button key={x.id} className={'ad-card' + (x.id === p.id ? ' on' : '')} onClick={() => setPid(x.id)}>
                <img src={thumb(x.cat, frameOf(x, xs.stage))} alt="" loading="lazy" decoding="async" />
                <div className="mk-card-shade" />
                <div className="ad-card-top">
                  <span className="sv-chip"><i style={{ background: xs.stage ? 'var(--green)' : 'var(--gold)' }} /> {x.stages[xs.stage].short}</span>
                  {x.custom && <span className="tag ok">нов</span>}
                </div>
                <div className="mk-card-body">
                  <span>{getC(x.cat).icon} {x.name}</span>
                  <b>{eur(xs.sold * x.price)}</b>
                  <div className="bar"><i style={{ width: (xs.sold / x.tokens) * 100 + '%' }} /></div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="ad-work">
        <div className="card ad-view">
          <div className="mk-head">
            <h3>{getC(p.cat).icon} {p.name}</h3>
            <Link className="small" href={'/project/' + p.id}>виж страницата →</Link>
          </div>
          <StageView key={p.id} p={p} stage={ps.stage} height={360} badge={<span className="sv-badge">токен ≈ {eur(fairValue(p, ps))}</span>} />
          <div className="ad-mini">
            <div><span>Набрани</span><b>{eur(raised)}</b></div>
            <div><span>Токени</span><b>{ps.sold} / {p.tokens}</b></div>
            <div><span>В ескроу</span><b>{eur(escrow)}</b></div>
            <div><span>Приход</span><b className="green">{eur(rev.total)}</b></div>
          </div>
        </div>

        <div className="card">
          <div className="seg ad-tabs">
            {[['stage', 'Етап'], ['money', 'Траншове'], ['news', 'Новина']].map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>)}
          </div>
          {tab === 'stage' && (
            <>
              <div className="ad-stages">
                {p.stages.map((st, i) => (
                  <button key={st.k} className={(i === ps.stage ? 'on ' : '') + (i < ps.stage ? 'done' : '')} onClick={() => (i === 1 && ps.stage === 0 ? complete(p.id) : setStage(p.id, i))}>
                    <img src={thumb(p.cat, frameOf(p, i))} alt="" loading="lazy" decoding="async" />
                    <span><b>{i + 1}</b> {st.k}</span>
                  </button>
                ))}
              </div>
              <label>{p.unit}: <b>{ps.prog}</b> / {p.N}</label>
              <input type="range" min="0" max={p.N} value={ps.prog} disabled={ps.stage !== L} onChange={(e) => setProg(p.id, +e.target.value)} />
              <p className="muted small">{ps.stage !== L ? `Плъзгачът се отключва на последния етап: „${p.stages[L].k}“.` : 'Всяко плащане се отразява веднага в профилите на инвеститорите.'}</p>
            </>
          )}
          {tab === 'money' && (
            <>
              <div className="ad-escrow"><span>В ескроу сметката</span><b>{eur(escrow)}</b><div className="bar"><i style={{ width: 100 - relPct + '%' }} /></div><em>{relPct}% освободени към партньора</em></div>
              <ul className="ad-tr">
                {p.tr.map((t, i) => t ? (
                  <li key={i}>
                    <img src={thumb(p.cat, frameOf(p, Math.min(i + 1, L)))} alt="" loading="lazy" decoding="async" />
                    <div className="grow"><b>Транш {i + 1} · {p.stages[i + 1].short}</b><span className="muted">{t}% · {eur((target(p) * t) / 100)}</span></div>
                    {ps.released[i] ? <span className="tag ok">освободен</span> : <button className="btn sm" disabled={ps.stage < i + 1} onClick={() => release(p.id, i)}>Освободи</button>}
                  </li>
                ) : null)}
              </ul>
              <p className="muted small">Транш се освобождава само след достигнат етап и доклад на независим надзор.</p>
            </>
          )}
          {tab === 'news' && (
            <>
              <p className="muted small">Новината излиза на страницата на проекта и при инвеститорите.</p>
              <textarea rows="4" value={news} onChange={(e) => setNews(e.target.value)} placeholder="Напр. Достигнат е следващият етап." />
              <div className="seg">
                {['Достигнат е нов етап.', 'Изплатено е тримесечно плащане.', 'Публикуван е отчетът на надзора.'].map((t) => <button key={t} onClick={() => setNews(t)}>{t}</button>)}
              </div>
              <button className="btn sm" disabled={!news.trim()} onClick={() => { addNews(p.id, news.trim()); setNews(''); }}>Публикувай</button>
              <ul className="news" style={{ marginTop: 14 }}>
                {s.news.filter((n) => n.pid === p.id).slice(0, 4).map((n, i) => <li key={i}><span>{n.d}</span>{n.t}</li>)}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="two" id="apps">
        <div className="card">
          <div className="mk-head"><h3>Заявки за нови проекти</h3><Link className="small" href="/owners">страницата за собственици →</Link></div>
          <ul className="ad-apps">
            {s.apps.map((a) => (
              <li key={a.id} className={a.status}>
                <img src={thumb(a.cat, STILLS[a.cat] - 1)} alt="" loading="lazy" decoding="async" />
                <div className="grow">
                  <b>{a.name}</b>
                  <span className="muted">{getC(a.cat).icon} {a.company} · {a.loc}</span>
                  <span className="ad-app-nums">{eur(a.amount)} · {a.ret}% · токен {eur(a.price)}</span>
                </div>
                <div className="ad-app-act">
                  {a.status === 'new' ? (
                    <>
                      <button className="btn sm" onClick={() => approveApp(a.id)}>Одобри и обяви</button>
                      <button className="btn ghost" onClick={() => rejectApp(a.id)}>Откажи</button>
                    </>
                  ) : a.status === 'approved' ? (
                    <Link className="tag ok" href={'/project/' + a.pid}>обявен · отвори →</Link>
                  ) : (
                    <span className="tag warn">отказан</span>
                  )}
                </div>
              </li>
            ))}
            {!s.apps.length && <li className="muted">Няма заявки.</li>}
          </ul>
        </div>
        <div className="card">
          <h3>Приходи по проекти</h3>
          <div className="ad-rev">
            {revs.map(({ x, r }) => (
              <div key={x.id}>
                <span>{getC(x.cat).icon} {x.name}</span>
                <div className="ad-rev-bar">
                  <i className="a" style={{ width: (r.raise / maxRev) * 100 + '%' }} />
                  <i className="b" style={{ width: (r.success / maxRev) * 100 + '%' }} />
                  <i className="c" style={{ width: (r.trade / maxRev) * 100 + '%' }} />
                </div>
                <b>{eur(r.total)}</b>
              </div>
            ))}
          </div>
          <div className="legend">
            <span><i style={{ background: 'var(--gold)' }} /> 4% при набиране</span>
            <span><i style={{ background: '#4fd39a' }} /> успех / управление</span>
            <span><i style={{ background: 'var(--blue)' }} /> 1% от пазара</span>
          </div>
          <p className="muted small">Таксите са примерен модел, а не пазарни данни.</p>
        </div>
      </section>

      <section className="card" id="kyc">
        <h3>Инвеститори</h3>
        <div className="ad-inv">
          <div className="ad-person me"><span className="pr-avatar sm">ДИ</span><div className="grow"><b>Демо Инвеститор (ти)</b><span className="muted">{eur(s.cash)} свободни · {s.investor && s.investor.tested ? `тест ${s.investor.score}/4 · нетно имущество ${eur(s.investor.netWorth)}` : 'тестът за знания не е попълнен'}</span></div><span className="tag ok">потвърден</span></div>
          {s.investors.map((x, i) => (
            <div key={x.n} className="ad-person">
              <span className="pr-avatar sm">{x.n.split(' ').map((w) => w[0]).join('')}</span>
              <div className="grow"><b>{x.n}</b><span className="muted">вложени {eur(x.sum)}</span></div>
              {x.kyc ? <span className="tag ok">потвърден</span> : <button className="btn sm" onClick={() => approveKyc(i)}>Одобри KYC</button>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
