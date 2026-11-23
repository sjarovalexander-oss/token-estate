'use client';
import Link from 'next/link';
import { useStore } from '../providers';
import { Count } from '../../components/Bits';
import { PROJECTS, getC, eur, target } from '../../lib/data';
import { usePrefs } from '../../lib/brand';

// Примерна история на платформата за демото — всички числа са измислени
const HIST = [
  { y: 2023, n: 4, raised: 1180000, done: 3, late: 1, def: 0, ret: 0.094 },
  { y: 2024, n: 7, raised: 2460000, done: 5, late: 1, def: 1, ret: 0.081 },
  { y: 2025, n: 9, raised: 3720000, done: 4, late: 2, def: 0, ret: 0.088 },
];
const CLOSED = [
  ['Жилищна сграда „Люлин 3“', 'stroitelstvo', 'Изплатен навреме', 'ok', '+19,2% за 22 мес.', 'Residential building “Lyulin 3”', 'Repaid on time', '+19.2% over 22 mo.'],
  ['Соларен парк „Хасково 1“', 'energia', 'Плаща по график', 'ok', '9,4% годишно', 'Solar park “Haskovo 1”', 'Paying on schedule', '9.4% a year'],
  ['Ремонт на офис „Лозенец“', 'remont', 'Изплатен с 4 мес. забава', 'late', '+11,0% за 18 мес.', 'Office renovation “Lozenets”', 'Repaid 4 months late', '+11.0% over 18 mo.'],
  ['Хотел „Пампорово Лодж“', 'hoteli', 'Неизпълнение · обезпечение в процес на реализация', 'bad', 'възстановени 72% до момента', 'Hotel “Pamporovo Lodge”', 'Default · security being enforced', '72% recovered so far'],
  ['Земеделска земя „Добрич 2“', 'zemia', 'Плаща по график', 'ok', '4,1% годишно + рента', 'Farmland “Dobrich 2”', 'Paying on schedule', '4.1% a year + rent'],
  ['Апартаменти под наем „Бургас“', 'naem', 'Плаща по график', 'ok', '6,8% годишно', 'Rental flats “Burgas”', 'Paying on schedule', '6.8% a year'],
];

export default function Statistics() {
  const { s } = useStore();
  const en = usePrefs().lang === 'en';
  const t = (b, e) => (en ? e : b);
  const totN = HIST.reduce((a, h) => a + h.n, 0);
  const totDef = HIST.reduce((a, h) => a + h.def, 0);
  const totLate = HIST.reduce((a, h) => a + h.late, 0);
  const totRaised = HIST.reduce((a, h) => a + h.raised, 0);
  const maxR = Math.max(...HIST.map((h) => h.raised));
  return (
    <>
      <section className="page-head">
        <div className="eyebrow">{t('Прозрачност', 'Transparency')}</div>
        <h1>{t('Статистика за проектите', 'Project statistics')}</h1>
        <p className="lead">{t('Как са се представили всички финансирани проекти: изплатени, със забава и в неизпълнение. Публикува се всяка година, за да можеш да прецениш риска сам.', 'How every funded project has performed: repaid, delayed and in default. Published every year so you can judge the risk yourself.')}</p>
        <p className="muted small">{t('⚠ Демо данни. Историята по-долу е измислена, за да покаже как ще изглежда страницата.', '⚠ Demo data. The history below is fictional, to show how the page will look.')}</p>
      </section>

      <section className="pf-kpis">
        <div className="card kpi"><span>{t('Финансирани проекти', 'Funded projects')}</span><b><Count to={totN} /></b><em className="kpi-sub">{t('от 2023 г.', 'since 2023')}</em></div>
        <div className="card kpi"><span>{t('Набрани общо', 'Total raised')}</span><b className="gold"><Count to={totRaised} fmt={eur} /></b><em className="kpi-sub">{t('приключили набирания', 'completed raises')}</em></div>
        <div className="card kpi"><span>{t('Дял на неизпълнение', 'Default rate')}</span><b className="red">{((totDef / totN) * 100).toFixed(1)}%</b><em className="kpi-sub">{totDef} {t('от', 'of')} {totN} {t('проекта', 'projects')}</em></div>
        <div className="card kpi"><span>{t('Със забава', 'Delayed')}</span><b>{((totLate / totN) * 100).toFixed(1)}%</b><em className="kpi-sub">{totLate} {t('проекта, изплатени по-късно', 'projects repaid late')}</em></div>
      </section>

      <section className="card">
        <h3>{t('По години', 'By year')}</h3>
        <div className="st-bars">
          {HIST.map((h) => (
            <div key={h.y} className="st-bar">
              <div className="st-col"><i style={{ height: (h.raised / maxR) * 100 + '%' }} /></div>
              <b>{h.y}</b>
              <span>{eur(h.raised)}</span>
            </div>
          ))}
        </div>
        <div className="st-scroll"><table className="tbl">
          <thead><tr><td>{t('Година', 'Year')}</td><td>{t('Проекти', 'Projects')}</td><td>{t('Приключили', 'Completed')}</td><td>{t('Със забава', 'Delayed')}</td><td>{t('Неизпълнение', 'Default')}</td><td>{t('Средна реализирана доходност', 'Average realised return')}</td></tr></thead>
          <tbody>
            {HIST.map((h) => (
              <tr key={h.y}><td>{h.y}</td><td>{h.n}</td><td>{h.done}</td><td>{h.late}</td><td className={h.def ? 'red' : ''}>{h.def}</td><td>{(h.ret * 100).toFixed(1)}%</td></tr>
            ))}
          </tbody>
        </table></div>
      </section>

      <section className="card">
        <h3>{t('Примерни приключили и текущи проекти', 'Sample completed and running projects')}</h3>
        <div className="st-list">
          {CLOSED.map(([n, cat, st, cls, r, ne, ste, re]) => (
            <div key={n} className="st-row">
              <span>{getC(cat).icon} {t(n, ne)}</span>
              <span className={'tag ' + (cls === 'ok' ? 'ok' : cls === 'late' ? 'warn' : 'bad')}>{t(st, ste)}</span>
              <b>{t(r, re)}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>{t('Проекти в демото в момента', 'Projects currently in the demo')}</h3>
        <div className="st-list">
          {PROJECTS.map((p) => {
            const ps = s.proj[p.id];
            if (!ps) return null;
            return (
              <Link key={p.id} href={'/project/' + p.id} className="st-row">
                <span>{getC(p.cat).icon} {p.name}</span>
                <span className="tag">{p.stages[ps.stage].k}</span>
                <b>{eur(ps.sold * p.price)} {t('от', 'of')} {eur(target(p))}</b>
              </Link>
            );
          })}
        </div>
        <p className="muted small">{en ? 'Default means the project owner has stopped payments for more than 90 days. The platform then starts enforcing the security on behalf of investors and publishes every recovered payment here.' : 'Неизпълнение означава, че собственикът на проекта е спрял плащанията за повече от 90 дни. Тогава платформата започва реализиране на обезпечението от името на инвеститорите и публикува всяко възстановено плащане тук.'}</p>
      </section>
    </>
  );
}
