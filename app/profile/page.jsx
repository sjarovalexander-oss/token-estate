'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useStore } from '../providers';
import { P, STAGES, fairValue, eur } from '../../lib/data';

const Building3D = dynamic(() => import('../../components/Building3D'), { ssr: false });

export default function Profile() {
  const { s } = useStore();
  const fair = fairValue(s);
  const buys = s.tx.filter((t) => t.t.startsWith('Покупка'));
  const bq = buys.reduce((a, t) => a + t.qty, 0);
  const avg = bq ? buys.reduce((a, t) => a + t.qty * t.price, 0) / bq : 0;
  const value = s.mine * fair;
  const cost = s.mine * avg;
  const paidShare = s.stage === 5 ? s.aptsSold / P.apts : 0;
  const paid = s.mine * P.payout * paidShare;

  return (
    <>
      <section className="page-head">
        <div>
          <div className="eyebrow">Профил на инвеститора</div>
          <h1>Здравей, Демо Инвеститор</h1>
          <p className="muted">Самоличност: <span className="tag ok">потвърдена (KYC)</span> · Тип: непрофесионален инвеститор</p>
        </div>
        <div className="card kpi">
          <span>Свободни средства</span>
          <b>{eur(s.cash)}</b>
        </div>
      </section>

      <section className="kpis">
        <div className="card kpi"><span>Моите токени</span><b>{s.mine} <small>от {P.tokens}</small></b></div>
        <div className="card kpi"><span>Текуща стойност</span><b className="gold">{eur(value)}</b></div>
        <div className="card kpi">
          <span>Спрямо вложеното</span>
          <b className={value >= cost ? 'green' : 'red'}>{value >= cost ? '+' : ''}{eur(value - cost)}</b>
        </div>
        <div className="card kpi"><span>Очаквано изплащане</span><b>{eur(s.mine * P.payout)}</b></div>
      </section>

      <section className="two wide-left">
        <div className="card">
          <h3>{P.name}</h3>
          <Building3D stage={s.stage} aptsSold={s.aptsSold} height={400} />
          <p className="muted small">
            Етап: {STAGES[s.stage].k}. Всеки продаден апартамент светва като прозорец: {s.aptsSold} от {P.apts}.
          </p>
        </div>
        <div className="card">
          <h3>Изплащания</h3>
          <div className="big gold">{eur(paid)}</div>
          <p className="muted small">изплатени от общо {eur(s.mine * P.payout)}</p>
          <div className="bar"><i style={{ width: paidShare * 100 + '%' }} /></div>
          <p className="muted small">
            Плащанията идват на части след всяка вълна продадени апартаменти. В демото това се управлява от админ панела.
          </p>
          <h3 style={{ marginTop: 22 }}>Моят дял</h3>
          <table className="tbl">
            <tbody>
              <tr><td>Средна цена на покупка</td><td>{eur(avg)}</td></tr>
              <tr><td>Ориентировъчна стойност на токен</td><td>{eur(fair)}</td></tr>
              <tr><td>Дял от токенизираната част</td><td>{((s.mine / P.tokens) * 100).toFixed(1)}%</td></tr>
            </tbody>
          </table>
          <div className="row">
            <Link className="btn sm" href="/market">Към вторичния пазар</Link>
            <button className="btn ghost">Сертификат за дял (PDF)</button>
          </div>
        </div>
      </section>

      <section className="two">
        <div className="card">
          <h3>История на операциите</h3>
          <table className="tbl full">
            <thead><tr><th>Дата</th><th>Операция</th><th>Брой</th><th>Цена</th></tr></thead>
            <tbody>
              {s.tx.map((t, i) => (
                <tr key={i}><td>{t.d}</td><td>{t.t}</td><td>{t.qty}</td><td>{eur(t.price)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Документи</h3>
          <ul className="docs">
            {['Основен информационен документ (KIIS)', 'Договор за инвестиция', 'Разрешение за строеж', 'Независима оценка на бюджета', 'Месечен отчет на строителния надзор'].map((d) => (
              <li key={d}><span>📄</span>{d}<em>демо</em></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
