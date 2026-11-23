'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from './providers';
import { Reveal, Count } from '../components/Bits';
import { Film } from '../components/Film';
import { CATS, PROJECTS, PROFILES, DEPOSIT, annual, eur, retLabel } from '../lib/data';
import { usePrefs, CATS_EN } from '../lib/brand';

const FAQ_EN = [
  ['What exactly do I buy with a token?', "A share of the financing of a specific project, recorded in the platform's register. It entitles you to part of the project's payouts. It does not give you the right to use the property itself."],
  ['Can I withdraw my money at any time?', 'Not guaranteed. You can list your tokens on the bulletin board, but you only exit if someone buys them, possibly below your purchase price.'],
  ['What if the full amount is not raised?', 'The project is cancelled and every investor gets their money back in full from the escrow account.'],
  ['Is the return guaranteed?', 'No. All returns are forecasts. With delays or weaker revenue you may receive less, and in a bad case lose part of what you invested.'],
  ["What if the project partner goes bankrupt?", "The asset sits in a separate company with security in favour of investors, so the partner's creditors cannot reach it. The risk is lower but does not disappear."],
  ['Is this a real platform?', 'No, this is a demo with fictional projects and figures. Offering such investments to the public requires a crowdfunding licence.'],
];

export default function Home() {
  const { s } = useStore();
  const [faq, setFaq] = useState(0);
  const en = usePrefs().lang === 'en';
  const t = (b, e) => (en ? e : b);
  const PRN = { cons: 'Conservative', bal: 'Balanced', dyn: 'Dynamic' };
  const [amt, setAmt] = useState(10000);
  const raised = PROJECTS.reduce((a, p) => a + s.proj[p.id].sold * p.price, 0);
  const goal = PROJECTS.reduce((a, p) => a + p.tokens * p.price, 0);
  const rateOf = (pr) => {
    let w = 0, r = 0;
    CATS.forEach((c) => { const p = PROJECTS.find((x) => x.cat === c.slug); const k = pr.w[c.slug] || 0; w += k; r += k * annual(p); });
    return r / w;
  };

  return (
    <>
      <Film name="home" height="420vh">
        <div className="eyebrow">{t('Платформа за токенизация на реални активи', 'Real-asset tokenization platform')}</div>
        <h1>{t('Инвестирай на части в сгради, енергия, хотели и земя', 'Invest in fractions of buildings, energy, hotels and land')}</h1>
        <p className="lead">{t('Реални проекти, разделени на токени от ', 'Real projects split into tokens from ')}<b>500 €</b>{t('. Избираш секция, следиш проекта на живо и получаваш своя дял от дохода.', '. Pick a section, follow the project live and receive your share of the income.')}</p>
        <div className="row">
          <a className="btn" href="#sections">{t('Виж шестте секции', 'See the six sections')}</a>
          <Link className="btn ghost lg" href="/portfolio">{t('Сглоби портфейл', 'Build a portfolio')}</Link>
        </div>
      </Film>

      <section className="story-intro" id="sections">
        <div className="eyebrow">{t('Шест секции · шест филма', 'Six sections · six films')}</div>
        <h2>{t('Избери секция и виж как се развива един проект', 'Pick a section and watch a project unfold')}</h2>
        <p className="muted">{t('Всяка секция се отваря на отделна страница със собствен филм, който се движи със скрола.', 'Each section opens on its own page with a film that moves as you scroll.')}</p>
        <div className="kpis three" style={{ maxWidth: 760, margin: '18px auto 0' }}>
          <div className="card kpi"><span>{t('Проекти', 'Projects')}</span><b><Count to={PROJECTS.length} /></b></div>
          <div className="card kpi"><span>{t('Набрани досега', 'Raised so far')}</span><b className="gold"><Count to={raised} fmt={eur} /></b></div>
          <div className="card kpi"><span>{t('Обща цел', 'Total target')}</span><b><Count to={goal} fmt={eur} /></b></div>
        </div>
      </section>

      <section className="secgrid">
        {CATS.map((c, i) => {
          const list = PROJECTS.filter((p) => p.cat === c.slug);
          const p = list[0], ps = s.proj[p.id];
          return (
            <Link key={c.slug} href={'/sector/' + c.slug} className="seccard">
              <img src={`/video/${c.slug}.jpg`} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <div className="sec-shade" />
              <span className="sec-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="sec-body">
                <div className="eyebrow">{c.icon} {list.length} {en ? (list.length === 1 ? 'project' : 'projects') : list.length === 1 ? 'проект' : 'проекта'} · {en ? CATS_EN[c.slug]?.term || c.term : c.term}</div>
                <h3>{en ? CATS_EN[c.slug]?.name || c.name : c.name}</h3>
                <p>{en ? CATS_EN[c.slug]?.lead || c.lead : c.lead}</p>
                <div className="sec-foot">
                  <span>{p.name} · <b className="gold">{retLabel(p)}</b></span>
                  <span>{Math.round((ps.sold / p.tokens) * 100)}% {t('набрани', 'raised')}</span>
                </div>
                <span className="btn sm">{t('Виж филма и проекта →', 'Watch the film and project →')}</span>
              </div>
            </Link>
          );
        })}
      </section>

      <Reveal className="kpis">
        {(en ? [['1', 'Pick a project', 'Six sections with different risk, term and payout.'], ['2', 'Buy tokens', 'From €500. Money stays in escrow until the raise succeeds.'], ['3', 'Follow it live', 'Stage photos, reports and payouts in your profile.'], ['4', 'Receive income', 'Quarterly or at the end. You can list your tokens for sale.']] : [['1', 'Избираш проект', 'Шест секции с различен риск, срок и начин на изплащане.'], ['2', 'Купуваш токени', 'От 500 €. Парите стоят в ескроу сметка до успешно набиране.'], ['3', 'Следиш на живо', 'Снимки по етапи, отчети и плащания в профила ти.'], ['4', 'Получаваш доход', 'На тримесечие или накрая. Можеш да пуснеш обява за продажба на токените.']]).map(([n, t, d]) => (
          <div key={n} className="card step"><b>{n}</b><h3>{t}</h3><p className="muted small">{d}</p></div>
        ))}
      </Reveal>

      <Reveal className="two">
        <div className="card">
          <div className="eyebrow">{t('Сглоби портфейл', 'Build a portfolio')}</div>
          <h2>{en ? `What could ${eur(amt)} become in 5 years?` : `Колко биха станали ${eur(amt)} за 5 години?`}</h2>
          <input type="range" min="1000" max="100000" step="1000" value={amt} onChange={(e) => setAmt(+e.target.value)} />
          <div className="cmp">
            <div><span>{t('Депозит 2%', '2% deposit')}</span><b>{eur(amt * (1 + DEPOSIT * 5))}</b></div>
            {PROFILES.map((pr) => (
              <div key={pr.k} className="hi"><span>{en ? PRN[pr.k] || pr.name : pr.name}</span><b className="gold">{eur(amt * (1 + rateOf(pr) * 5))}</b><em>≈ {(rateOf(pr) * 100).toFixed(1)}% {t('годишно', 'a year')}</em></div>
            ))}
          </div>
          <p className="muted small">{t('Проста сметка без реинвестиране и данъци, по прогнозните доходности на демо проектите. Депозитът е гарантиран, тези инвестиции не са.', 'Simple maths without reinvestment or tax, using the forecast returns of the demo projects. A deposit is guaranteed; these investments are not.')}</p>
          <Link className="btn sm" href="/portfolio">{t('Сглоби своя портфейл →', 'Build your portfolio →')}</Link>
        </div>
        <div className="card owners-cta">
          <div className="eyebrow">{t('За строители и собственици на активи', 'For developers and asset owners')}</div>
          <h2>{t('Имаш проект и търсиш финансиране?', 'Have a project and need funding?')}</h2>
          <p className="muted">{t('Набери до 5 000 000 € от много инвеститори. Плащаш такса само при успешно набиране, а парите получаваш на траншове.', 'Raise up to €5,000,000 from many investors. You pay a fee only if the raise succeeds, and receive the money in tranches.')}</p>
          <ul className="checks">
            <li>{t('Без да даваш дял от фирмата си.', 'Without giving up equity in your company.')}</li>
            <li>{t('Собствена страница с филм и визуализация на проекта.', 'Your own page with a film and project visuals.')}</li>
            <li>{t('Готови инвеститори и табло за обяви.', 'Ready investors and a bulletin board.')}</li>
          </ul>
          <Link className="btn sm" href="/owners">{t('Подай заявка →', 'Apply →')}</Link>
        </div>
      </Reveal>

      <Reveal className="card">
        <h3>{t('Често задавани въпроси', 'Frequently asked questions')}</h3>
        <div className="faq">
          {(en ? FAQ_EN : [
            ['Какво точно купувам с един токен?', 'Дял от финансирането на конкретен проект, записан в регистъра на платформата. Токенът ти дава право на част от плащанията по проекта. Не получаваш право да ползваш самия имот.'],
            ['Мога ли да си изтегля парите по всяко време?', 'Не е гарантирано. Можеш да пуснеш обява за токените си на таблото, но ще излезеш само ако някой ги купи, и цената може да е под тази, на която си купил.'],
            ['Какво става, ако не се набере цялата сума?', 'Проектът се отменя и всеки инвеститор получава парите си обратно изцяло от ескроу сметката.'],
            ['Гарантирана ли е доходността?', 'Не. Всички доходности са прогнози. При забава или по-слаби приходи можеш да получиш по-малко, а в лош случай да загубиш част от вложеното.'],
            ['Какво става, ако партньорът по проекта фалира?', 'Активът е в отделно дружество и има обезпечение в полза на инвеститорите, така че кредиторите на партньора нямат достъп до него. Рискът намалява, но не изчезва.'],
            ['Това истинска платформа ли е?', 'Не, това е демо с измислени проекти и цифри. Реалното предлагане на такива инвестиции изисква лиценз от КФН.'],
          ]).map(([q, a], i) => (
            <div key={q} className={'fq' + (faq === i ? ' open' : '')} onClick={() => setFaq(faq === i ? -1 : i)}>
              <b>{q}<i>+</i></b>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </>
  );
}
