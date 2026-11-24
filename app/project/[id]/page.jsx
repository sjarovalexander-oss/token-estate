'use client';
import { EnNote } from '../../../lib/brand';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '../../providers';
import { LoopVideo } from '../../../components/Film';
import BuyModal from '../../../components/BuyModal';
import { PayoutChart } from '../../../components/Bits';
import { FEE, PROJECTS, getP, getC, eur, last, target, totalPer, retLabel, termLabel } from '../../../lib/data';
import StageView from '../../../components/StageView';


function Countdown({ to }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const d = Math.max(0, to - now);
  const parts = [[Math.floor(d / 864e5), 'дни'], [Math.floor(d / 36e5) % 24, 'часа'], [Math.floor(d / 6e4) % 60, 'мин'], [Math.floor(d / 1e3) % 60, 'сек']];
  return (
    <div className="cd">
      {parts.map(([v, l]) => (
        <div key={l}><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>
      ))}
    </div>
  );
}

function Calculator({ p }) {
  const [n, setN] = useState(2);
  const [sc, setSc] = useState(0);
  const exit = p.type === 'exit';
  const mid = p.stages[Math.max(1, Math.floor(last(p) / 2))];
  const scen = exit
    ? [
        { t: 'По план', m: p.months, out: p.payout, note: 'Проектът приключва в срок и токенът се изплаща по ' + eur(p.payout) + '.' },
        { t: 'Забава 6 месеца', m: p.months + 6, out: p.payout, note: 'Същата сума, но по-късно: годишната доходност пада.' },
        { t: 'Ранен изход', m: mid.month, out: mid.fair * (1 - FEE.trade), note: 'Продажба чрез таблото за обяви на етап „' + mid.short + '“ минус 1% такса. Зависи дали има купувач.' },
      ]
    : [
        { t: 'По план', m: p.years * 12, out: p.price * (1 + p.yld * p.years), note: 'Тримесечни плащания за ' + p.years + ' години и връщане на вложената сума накрая.' },
        { t: 'Доход с 20% по-нисък', m: p.years * 12, out: p.price * (1 + p.yld * 0.8 * p.years), note: 'По-слаби приходи на проекта: плащанията намаляват, вложената сума се връща.' },
        { t: 'Ранен изход (2 години)', m: 24, out: p.price * p.yld * 2 + p.stages[last(p)].fair * (1 - FEE.trade), note: 'Получен доход за 2 години плюс продажба чрез таблото за обяви минус 1% такса.' },
      ];
  const x = scen[sc];
  const inv = n * p.price;
  const out = n * x.out;
  const yr = ((out / inv - 1) / (x.m / 12)) * 100;
  return (
    <div className="card calc">
      <h3>Калкулатор за инвеститора</h3>
      <label>Брой токени: <b>{n}</b></label>
      <input type="range" min="1" max="40" value={n} onChange={(e) => setN(+e.target.value)} />
      <div className="seg">
        {scen.map((q, i) => (
          <button key={q.t} className={sc === i ? 'on' : ''} onClick={() => setSc(i)}>{q.t}</button>
        ))}
      </div>
      <div className="calc-grid">
        <div><span>Влагаш</span><b>{eur(inv)}</b></div>
        <div><span>Получаваш общо за {x.m} мес.</span><b className="gold">{eur(out)}</b></div>
        <div><span>Печалба</span><b className="green">+{eur(out - inv)}</b></div>
        <div><span>≈ годишно</span><b>{yr.toFixed(1)}%</b></div>
      </div>
      {!exit && <p className="muted small">На тримесечие: {eur((n * p.price * p.yld) / 4)}.</p>}
      <p className="muted small">{x.note} Цифрите са илюстрация, не обещание.</p>
    </div>
  );
}

export default function Project() {
  const { id } = useParams();
  const p = getP(id);
  const { s, tick, complete } = useStore();
  const [modal, setModal] = useState(false);
  const [q, setQ] = useState(1);
  const [flash, setFlash] = useState(false);
  const ps = p ? s.proj[p.id] : null;
  const open = !!p && ps.stage === 0 && ps.sold < p.tokens;

  useEffect(() => {
    if (!open) return;
    const i = setInterval(() => {
      if (Math.random() < 0.45) {
        tick(p.id);
        setFlash(true);
        setTimeout(() => setFlash(false), 900);
      }
    }, 3500);
    return () => clearInterval(i);
  }, [open, tick, p]);

  if (!p) return <section className="card center"><h2>Няма такъв проект</h2><Link className="btn sm" href="/">Към проектите</Link></section>;
  const c = getC(p.cat);
  const pct = (ps.sold / p.tokens) * 100;
  const others = ps.sold - ps.mine;
  const news = s.news.filter((n) => n.pid === p.id);

  return (
    <>
      <EnNote />
      <section className="vbanner">
        <LoopVideo name={p.cat} key={p.cat} />
        <div className="film-shade" />
        <div className="vb-txt">
          <div className="eyebrow">{p.loc}</div>
          <h2>{c.name}</h2>
        </div>
      </section>

      <section className="hero">
        <div className="hero-3d">
          <StageView key={p.id} p={p} stage={ps.stage} height={560} badge={ps.stage === last(p) && <span className="sv-badge">{p.unit}: {ps.prog} / {p.N}</span>} />
        </div>
        <div className="hero-txt">
          <div className="eyebrow"><Link href={'/sector/' + c.slug}>{c.name}</Link> · {p.loc}</div>
          <h1>{p.name}</h1>
          <p className="lead">
            {p.tagline} Един токен струва <b>{eur(p.price)}</b> и носи прогнозно <b>{retLabel(p)}</b>.
          </p>
          <div className={'card sale' + (flash ? ' flash' : '')}>
            <div className="sale-top">
              <div>
                <span className="muted">Продадени токени</span>
                <div className="big">{ps.sold} <small>/ {p.tokens}</small></div>
              </div>
              <div className="right">
                <span className="muted">Набрани</span>
                <div className="big gold">{eur(ps.sold * p.price)}</div>
              </div>
            </div>
            <div className="bar"><i style={{ width: pct + '%' }} /></div>
            {open ? (
              <>
                <div className="sale-mid">
                  <span className="muted">Кампанията приключва след</span>
                  <Countdown to={ps.deadline} />
                </div>
                <div className="buy">
                  <div className="qty">
                    <button onClick={() => setQ(Math.max(1, q - 1))}>−</button>
                    <b>{q}</b>
                    <button onClick={() => setQ(Math.min(p.tokens - ps.sold, q + 1))}>+</button>
                  </div>
                  <button className="btn" onClick={() => setModal(true)} disabled={s.cash < q * p.price}>
                    Купи за {eur(q * p.price)}
                  </button>
                </div>
                <p className="muted small">
                  Парите стоят в ескроу сметка. Ако не се наберат всички {p.tokens} токена, получаваш си ги обратно изцяло.
                </p>
              </>
            ) : (
              <p className="ok">
                ✓ Набирането е успешно. Токените могат да се прехвърлят чрез <Link href={'/market?p=' + p.id}>таблото за обяви</Link> между инвеститори.
              </p>
            )}
          </div>
        </div>
      </section>

      {modal && <BuyModal p={p} q={q} onClose={() => setModal(false)} />}

      <section className="kpis">
        <div className="card kpi"><span>Цена на токен</span><b>{eur(p.price)}</b></div>
        <div className="card kpi"><span>Общо за един токен</span><b className="gold">{eur(totalPer(p))}</b></div>
        <div className="card kpi"><span>Прогнозна доходност</span><b>{retLabel(p)}</b></div>
        <div className="card kpi"><span>Срок</span><b>{termLabel(p)}</b></div>
      </section>

      <section className="two">
        <Calculator p={p} />
        <div className="card">
          <h3>{p.tokens} токена на живо</h3>
          <div className={'grid200' + (p.tokens > 300 ? ' dense' : '')}>
            {Array.from({ length: p.tokens }, (_, i) => (
              <i key={i} className={i < others ? 'sold' : i < ps.sold ? 'mine' : 'free'} />
            ))}
          </div>
          <div className="legend">
            <span><i className="sold" /> продадени</span>
            <span><i className="mine" /> твои ({ps.mine})</span>
            <span><i className="free" /> свободни ({p.tokens - ps.sold})</span>
          </div>
        </div>
      </section>

      <section className="two wide-left">
        <div className="card">
          <h3>Какво получаваш за един токен във времето</h3>
          <PayoutChart p={p} ps={ps} />
          <p className="muted small">
            {p.type === 'exit'
              ? 'Плащанията идват на части, докато се продава проектът, до общо ' + eur(p.payout) + ' за токен.'
              : 'По ' + eur((p.price * p.yld) / 4) + ' на тримесечие за ' + p.years + ' години, а накрая се връща и вложената сума от ' + eur(p.price) + '.'}{' '}
            Плътната линия показва вече изплатеното. Илюстрация, не обещание.
          </p>
        </div>
        <div className="card">
          <h3>Други проекти</h3>
          <ul className="news">
            {PROJECTS.filter((x) => x.id !== p.id).slice(0, 5).map((x) => (
              <li key={x.id}><Link className="grow" href={'/project/' + x.id}>{x.name}</Link><b className="gold">{retLabel(x)}</b></li>
            ))}
          </ul>
          <Link className="btn ghost" href="/portfolio">Сравни всички →</Link>
        </div>
      </section>

      <section className="card">
        <h3>График на проекта</h3>
        <div className="timeline" style={{ '--n': p.stages.length }}>
          {p.stages.map((st, i) => (
            <div key={st.k} className={'tl' + (i < ps.stage ? ' done' : i === ps.stage ? ' now' : '')}>
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
          <h3>Числата на проекта</h3>
          <table className="tbl">
            <tbody>
              {p.facts.map(([l, v]) => (
                <tr key={l} className={l.startsWith('Токени') ? 'hl' : ''}><td>{l}</td><td>{v}</td></tr>
              ))}
              <tr><td>Цел на набирането</td><td>{eur(target(p))}</td></tr>
            </tbody>
          </table>
          <p className="muted small">Собственик на актива: {p.spv} (отделно дружество за проекта). {p.partner}.</p>
          {p.bonus && <p className="ok small">{p.bonus}</p>}
        </div>
        <div className="card">
          <h3>Как са защитени инвеститорите</h3>
          <ul className="checks">
            <li><b>Всичко или нищо.</b> Без набрана цялата сума до крайния срок парите се връщат.</li>
            <li><b>Ескроу сметка.</b> Средствата не минават през платформата.</li>
            <li><b>Отделно дружество.</b> Активът не е собственост на партньора по проекта.</li>
            <li><b>Обезпечение</b> в полза на инвеститорите чрез независим довереник.</li>
            <li><b>Плащане на траншове</b> само след достигнат етап и независима проверка.</li>
          </ul>
          <h3 style={{ marginTop: 20 }}>Основни рискове</h3>
          <ul className="risks">{c.risks.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      </section>

      <section className="card">
        <h3>Новини от проекта</h3>
        <ul className="news">
          {news.map((n, i) => (<li key={i}><span>{n.d}</span>{n.t}</li>))}
          {!news.length && <li className="muted">Още няма новини.</li>}
        </ul>
      </section>
    </>
  );
}
