'use client';
import { useState } from 'react';
import { useStore } from '../providers';
import { P, STAGES, TRANCHES, fairValue, eur } from '../../lib/data';

export default function Admin() {
  const { s, setStage, setApts, complete, release, approveKyc, addNews, reset } = useStore();
  const [news, setNews] = useState('');
  const raised = s.sold * P.price;
  const success = s.stage > 0;
  const releasedPct = TRANCHES.reduce((a, t, i) => a + (s.released[i] ? t.pct : 0), 0);
  const escrow = success ? raised * (1 - releasedPct / 100) : raised;
  const feeRaise = success ? raised * P.feeRaise : 0;
  const feeProfit = s.stage === 5 ? (P.revenue - P.cost) * P.feeProfit * (s.aptsSold / P.apts) : 0;
  const others = s.sold - s.mine - s.investors.reduce((a, x) => a + x.tok, 0);

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">Админ панел · оператор на платформата</div>
          <h1>Управление на проекта</h1>
          <p className="muted">Демо достъп без парола. Промените тук се виждат веднага в останалите страници.</p>
        </div>
        <button className="btn ghost" onClick={reset}>Нулирай демото</button>
      </section>

      <section className="kpis">
        <div className="card kpi"><span>Набрани средства</span><b className="gold">{eur(raised)}</b></div>
        <div className="card kpi"><span>Продадени токени</span><b>{s.sold} <small>/ {P.tokens}</small></b></div>
        <div className="card kpi"><span>В ескроу сметка</span><b>{eur(escrow)}</b></div>
        <div className="card kpi"><span>Приходи на платформата</span><b className="green">{eur(feeRaise + feeProfit + s.fees)}</b></div>
      </section>

      <section className="two">
        <div className="card">
          <h3>Етап на проекта</h3>
          <div className="stages">
            {STAGES.map((st, i) => (
              <button key={st.k} className={i === s.stage ? 'on' : ''} onClick={() => (i === 1 && s.stage === 0 ? complete() : setStage(i))}>
                <b>{i + 1}</b> {st.k}
              </button>
            ))}
          </div>
          <p className="muted small">
            Смяната на етапа променя 3D модела и ориентировъчната стойност на токена (сега {eur(fairValue(s))}).
          </p>
          <label>Продадени апартаменти: <b>{s.aptsSold}</b> / {P.apts}</label>
          <input type="range" min="0" max={P.apts} value={s.aptsSold} disabled={s.stage !== 5} onChange={(e) => setApts(+e.target.value)} />
          {s.stage !== 5 && <p className="muted small">Активно на етап „Продажби и изплащане“.</p>}
        </div>
        <div className="card">
          <h3>Траншове от ескроу към строителя</h3>
          <table className="tbl full">
            <tbody>
              {TRANCHES.map((t, i) => (
                <tr key={t.name}>
                  <td>{t.name}</td>
                  <td>{t.pct}% · {eur((P.tokens * P.price * t.pct) / 100)}</td>
                  <td className="right">
                    {s.released[i] ? (
                      <span className="tag ok">освободен</span>
                    ) : (
                      <button className="btn sm" disabled={s.stage < t.stage} onClick={() => release(i)}>Освободи</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">Транш се освобождава само след достигнат етап и доклад на строителния надзор.</p>
        </div>
      </section>

      <section className="two">
        <div className="card">
          <h3>Инвеститори</h3>
          <table className="tbl full">
            <thead><tr><th>Име</th><th>Токени</th><th>KYC</th><th /></tr></thead>
            <tbody>
              <tr className="hl"><td>Демо Инвеститор (ти)</td><td>{s.mine}</td><td><span className="tag ok">потвърден</span></td><td /></tr>
              {s.investors.map((x, i) => (
                <tr key={x.n}>
                  <td>{x.n}</td>
                  <td>{x.tok}</td>
                  <td><span className={'tag ' + (x.kyc ? 'ok' : 'warn')}>{x.kyc ? 'потвърден' : 'чака проверка'}</span></td>
                  <td className="right">{!x.kyc && <button className="btn sm" onClick={() => approveKyc(i)}>Одобри</button>}</td>
                </tr>
              ))}
              {others > 0 && <tr><td className="muted">Други инвеститори</td><td>{others}</td><td /><td /></tr>}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Приходи на платформата</h3>
          <table className="tbl">
            <tbody>
              <tr><td>4% такса при успешно набиране</td><td>{eur(feeRaise)}</td></tr>
              <tr><td>10% от печалбата на проекта (при продажби)</td><td>{eur(feeProfit)}</td></tr>
              <tr><td>1% от сделките на вторичния пазар</td><td>{eur(s.fees)}</td></tr>
              <tr className="hl"><td>Общо</td><td>{eur(feeRaise + feeProfit + s.fees)}</td></tr>
            </tbody>
          </table>
          <p className="muted small">Таксите са примерен модел, а не пазарни данни.</p>
          <h3 style={{ marginTop: 22 }}>Публикувай новина</h3>
          <textarea rows="3" value={news} onChange={(e) => setNews(e.target.value)} placeholder="Напр. Издаден е Акт 14 за сградата." />
          <button className="btn sm" disabled={!news.trim()} onClick={() => { addNews(news.trim()); setNews(''); }}>Публикувай</button>
        </div>
      </section>
    </>
  );
}
