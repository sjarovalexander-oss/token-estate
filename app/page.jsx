'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from './providers';
import { Reveal, Count } from '../components/Bits';
import { Film } from '../components/Film';
import { CATS, PROJECTS, PROFILES, DEPOSIT, annual, eur, retLabel } from '../lib/data';

export default function Home() {
  const { s } = useStore();
  const [faq, setFaq] = useState(0);
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
      <Film name="home" height="180vh">
        <div className="eyebrow">Платформа за токенизация на реални активи</div>
        <h1>Инвестирай на части в сгради, енергия, хотели и земя</h1>
        <p className="lead">Реални проекти, разделени на токени от <b>500 €</b>. Избираш секция, следиш проекта на живо и получаваш своя дял от дохода.</p>
        <div className="row">
          <a className="btn" href="#sections">Виж шестте секции</a>
          <Link className="btn ghost lg" href="/portfolio">Сглоби портфейл</Link>
        </div>
      </Film>

      <section className="story-intro" id="sections">
        <div className="eyebrow">Шест секции · шест филма</div>
        <h2>Избери секция и виж как се развива един проект</h2>
        <p className="muted">Всяка секция се отваря на отделна страница със собствен филм, който се движи със скрола.</p>
        <div className="kpis three" style={{ maxWidth: 760, margin: '18px auto 0' }}>
          <div className="card kpi"><span>Проекти</span><b><Count to={PROJECTS.length} /></b></div>
          <div className="card kpi"><span>Набрани досега</span><b className="gold"><Count to={raised} fmt={eur} /></b></div>
          <div className="card kpi"><span>Обща цел</span><b><Count to={goal} fmt={eur} /></b></div>
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
                <div className="eyebrow">{c.icon} {list.length} {list.length === 1 ? 'проект' : 'проекта'} · {c.term}</div>
                <h3>{c.name}</h3>
                <p>{c.lead}</p>
                <div className="sec-foot">
                  <span>{p.name} · <b className="gold">{retLabel(p)}</b></span>
                  <span>{Math.round((ps.sold / p.tokens) * 100)}% набрани</span>
                </div>
                <span className="btn sm">Виж филма и проекта →</span>
              </div>
            </Link>
          );
        })}
      </section>

      <Reveal className="kpis">
        {[['1', 'Избираш проект', 'Шест секции с различен риск, срок и начин на изплащане.'], ['2', 'Купуваш токени', 'От 500 €. Парите стоят в ескроу сметка до успешно набиране.'], ['3', 'Следиш на живо', 'Снимки по етапи, отчети и плащания в профила ти.'], ['4', 'Получаваш доход', 'На тримесечие или накрая. Можеш да продадеш на вторичния пазар.']].map(([n, t, d]) => (
          <div key={n} className="card step"><b>{n}</b><h3>{t}</h3><p className="muted small">{d}</p></div>
        ))}
      </Reveal>

      <Reveal className="two">
        <div className="card">
          <div className="eyebrow">Сглоби портфейл</div>
          <h2>Колко биха станали {eur(amt)} за 5 години?</h2>
          <input type="range" min="1000" max="100000" step="1000" value={amt} onChange={(e) => setAmt(+e.target.value)} />
          <div className="cmp">
            <div><span>Депозит 2%</span><b>{eur(amt * (1 + DEPOSIT * 5))}</b></div>
            {PROFILES.map((pr) => (
              <div key={pr.k} className="hi"><span>{pr.name}</span><b className="gold">{eur(amt * (1 + rateOf(pr) * 5))}</b><em>≈ {(rateOf(pr) * 100).toFixed(1)}% годишно</em></div>
            ))}
          </div>
          <p className="muted small">Проста сметка без реинвестиране и данъци, по прогнозните доходности на демо проектите. Депозитът е гарантиран, тези инвестиции не са.</p>
          <Link className="btn sm" href="/portfolio">Сглоби своя портфейл →</Link>
        </div>
        <div className="card owners-cta">
          <div className="eyebrow">За строители и собственици на активи</div>
          <h2>Имаш проект и търсиш финансиране?</h2>
          <p className="muted">Набери до 5 000 000 € от много инвеститори. Плащаш такса само при успешно набиране, а парите получаваш на траншове.</p>
          <ul className="checks">
            <li>Без да даваш дял от фирмата си.</li>
            <li>Собствена страница с филм и визуализация на проекта.</li>
            <li>Готови инвеститори и вторичен пазар.</li>
          </ul>
          <Link className="btn sm" href="/owners">Подай заявка →</Link>
        </div>
      </Reveal>

      <Reveal className="card">
        <h3>Често задавани въпроси</h3>
        <div className="faq">
          {[
            ['Какво точно купувам с един токен?', 'Дял от финансирането на конкретен проект, записан в регистъра на платформата. Токенът ти дава право на част от плащанията по проекта. Не получаваш право да ползваш самия имот.'],
            ['Мога ли да си изтегля парите по всяко време?', 'Не е гарантирано. Можеш да пуснеш токените си на вторичния пазар, но ще излезеш само ако някой ги купи, и цената може да е под тази, на която си купил.'],
            ['Какво става, ако не се набере цялата сума?', 'Проектът се отменя и всеки инвеститор получава парите си обратно изцяло от ескроу сметката.'],
            ['Гарантирана ли е доходността?', 'Не. Всички доходности са прогнози. При забава или по-слаби приходи можеш да получиш по-малко, а в лош случай да загубиш част от вложеното.'],
            ['Какво става, ако партньорът по проекта фалира?', 'Активът е в отделно дружество и има обезпечение в полза на инвеститорите, така че кредиторите на партньора нямат достъп до него. Рискът намалява, но не изчезва.'],
            ['Това истинска платформа ли е?', 'Не, това е демо с измислени проекти и цифри. Реалното предлагане на такива инвестиции изисква лиценз от КФН.'],
          ].map(([q, a], i) => (
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
