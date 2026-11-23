'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useStore } from './providers';
import ProjectCard from '../components/ProjectCard';
import { Reveal, Count } from '../components/Bits';
import { CATS, PROJECTS, PROFILES, DEPOSIT, annual, eur, last } from '../lib/data';

const Scene3D = dynamic(() => import('../components/Scene3D'), { ssr: false });

export default function Home() {
  const { s, tick } = useStore();
  const [ci, setCi] = useState(0);
  const [auto, setAuto] = useState(true);
  const cat = CATS[ci];
  const feat = PROJECTS.find((p) => p.cat === cat.slug);

  useEffect(() => {
    if (!auto) return;
    const i = setInterval(() => setCi((x) => (x + 1) % CATS.length), 7000);
    return () => clearInterval(i);
  }, [auto]);

  // продажби на живо в случаен проект + лента с активност
  const [feed, setFeed] = useState([]);
  const [faq, setFaq] = useState(0);
  const [amt, setAmt] = useState(10000);
  useEffect(() => {
    const i = setInterval(() => {
      const p = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
      if (Math.random() < 0.6) {
        tick(p.id);
        setFeed((f) => [{ id: Date.now(), t: 'Инвеститор #' + (100 + Math.floor(Math.random() * 900)) + ' купи токен от „' + p.name.replace(/[„“]/g, '') + '“ за ' + eur(p.price) }, ...f].slice(0, 4));
      }
    }, 3000);
    return () => clearInterval(i);
  }, [tick]);
  const rateOf = (pr) => {
    let w = 0, r = 0;
    CATS.forEach((c) => { const p = PROJECTS.find((x) => x.cat === c.slug); const k = pr.w[c.slug] || 0; w += k; r += k * annual(p); });
    return r / w;
  };

  const raised = PROJECTS.reduce((a, p) => a + s.proj[p.id].sold * p.price, 0);
  const goal = PROJECTS.reduce((a, p) => a + p.tokens * p.price, 0);

  return (
    <>
      <section className="hero">
        <div className="hero-txt">
          <div className="eyebrow">Платформа за токенизация на реални активи</div>
          <h1>Инвестирай на части в сгради, енергия, хотели и земя</h1>
          <p className="lead">
            Шест секции с различен риск, срок и начин на изплащане. Всеки проект е разделен на токени, които купуваш от{' '}
            <b>500 €</b> и можеш да продадеш на вторичния пазар.
          </p>
          <div className="kpis three">
            <div className="card kpi"><span>Проекти</span><b><Count to={PROJECTS.length} /> <small>в {CATS.length} секции</small></b></div>
            <div className="card kpi"><span>Набрани досега</span><b className="gold"><Count to={raised} fmt={eur} /></b></div>
            <div className="card kpi"><span>Обща цел</span><b><Count to={goal} fmt={eur} /></b></div>
          </div>
          <div className="row">
            <a className="btn" href="#sections">Разгледай секциите</a>
            <Link className="btn ghost lg" href="/portfolio">Сглоби портфейл</Link>
          </div>
        </div>
        <div className="hero-3d">
          <Scene3D key={feat.scene} type={feat.scene} stage={last(feat)} frac={0.6} height={520} />
          <div className="chips over">
            {CATS.map((c, i) => (
              <button key={c.slug} className={i === ci ? 'on' : ''} onClick={() => { setCi(i); setAuto(false); }}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <Link href={'/project/' + feat.id} className="stage-chip">{feat.name} · отвори проекта →</Link>
        </div>
      </section>

      <div className="ticker">
        <span className="live">● НА ЖИВО</span>
        {feed.length ? feed.map((f) => <span key={f.id} className="tk">{f.t}</span>) : <span className="tk muted">Изчакване на следващата покупка…</span>}
      </div>

      <Reveal className="kpis">
        {[['1', 'Избираш проект', 'Шест секции с различен риск, срок и начин на изплащане.'], ['2', 'Купуваш токени', 'От 500 €. Парите стоят в ескроу сметка до успешно набиране.'], ['3', 'Следиш на живо', '3D модел, етапи, отчети и плащания в профила ти.'], ['4', 'Получаваш доход', 'На тримесечие или накрая. Можеш да продадеш на вторичния пазар.']].map(([n, t, d]) => (
          <div key={n} className="card step"><b>{n}</b><h3>{t}</h3><p className="muted small">{d}</p></div>
        ))}
      </Reveal>

      <nav className="chips" id="sections">
        {CATS.map((c) => (
          <a key={c.slug} href={'#' + c.slug}>{c.icon} {c.name}</a>
        ))}
      </nav>

      {CATS.map((c) => (
        <Reveal key={c.slug} id={c.slug} className="sector">
          <div className="sector-head card">
            <div className="sector-icon">{c.icon}</div>
            <div className="grow">
              <h2>{c.name}</h2>
              <p className="muted">{c.lead}</p>
              <div className="pills">
                <span>Срок: <b>{c.term}</b></span>
                <span>Доходност: <b>{c.ret}</b></span>
                <span>{c.income.split('.')[0]}</span>
              </div>
            </div>
            <Link className="btn ghost" href={'/sector/' + c.slug}>Към секцията →</Link>
          </div>
          <div className="cards">
            {PROJECTS.filter((p) => p.cat === c.slug).map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
            <div className="pcard soon">
              <div className="pc-body">
                <div className="eyebrow">Скоро</div>
                <h3>Следващ проект в „{c.name}“</h3>
                <p className="muted small">Всеки проект минава проверка на документите, бюджета и партньора, преди да бъде обявен.</p>
                <Link className="btn ghost" href={'/owners?cat=' + c.slug}>Предложи проект</Link>
              </div>
            </div>
          </div>
        </Reveal>
      ))}

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
            <li>Собствена страница с 3D модел на проекта.</li>
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

      <section className="card">
        <h3>Новини от проектите</h3>
        <ul className="news">
          {s.news.slice(0, 8).map((n, i) => (
            <li key={i}>
              <span>{n.d}</span>
              <span className="grow"><b>{PROJECTS.find((p) => p.id === n.pid)?.name}:</b> {n.t}</span>
            </li>
          ))}
        </ul>
        <p className="muted small">Диапазоните за срок и доходност по секции са илюстрация, а не пазарни данни или обещание.</p>
      </section>
    </>
  );
}
