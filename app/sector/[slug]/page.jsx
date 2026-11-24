'use client';
import { EnNote } from '../../../lib/brand';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Film, Story } from '../../../components/Film';
import { STORY } from '../../../lib/story';
import ProjectCard from '../../../components/ProjectCard';
import { CATS, PROJECTS, getC, last } from '../../../lib/data';
import StageView from '../../../components/StageView';


export default function Sector() {
  const { slug } = useParams();
  const c = getC(slug);
  if (!c) return <section className="card center"><h2>Няма такава секция</h2><Link className="btn sm" href="/">Към проектите</Link></section>;
  const list = PROJECTS.filter((p) => p.cat === c.slug);
  const feat = list[0];
  return (
    <>
      <EnNote />


<Story key={c.slug} name={c.slug} chapters={STORY[c.slug]} label={c.name + ' · скролни надолу'} />

      <nav className="chips" style={{ marginTop: 18 }}>
        {CATS.map((x) => (
          <Link key={x.slug} href={'/sector/' + x.slug} className={x.slug === c.slug ? 'on' : ''}>{x.name}</Link>
        ))}
      </nav>

      <section className="hero">
        <div className="hero-txt">
          <div className="eyebrow">{c.name}</div>
          <h2 className="h1s">{c.income.split('.')[0]}.</h2>
          <div className="kpis three">
            <div className="card kpi"><span>Типичен срок</span><b>{c.term}</b></div>
            <div className="card kpi"><span>Типична доходност</span><b className="gold">{c.ret}</b></div>
            <div className="card kpi"><span>Активни проекти</span><b>{list.length}</b></div>
          </div>
          <p className="muted small">Диапазоните са илюстрация за демото, а не пазарни данни или обещание.</p>
        </div>
        <div className="hero-3d">
          <StageView key={feat.id} p={feat} auto height={460} badge={<Link href={'/project/' + feat.id} className="sv-badge">{feat.name} · отвори →</Link>} />
        </div>
      </section>

      <section className="two">
        <div className="card">
          <h3>Как работи</h3>
          <ol className="steps">{c.how.map((h) => <li key={h}>{h}</li>)}</ol>
        </div>
        <div className="card">
          <h3>Как получаваш парите си</h3>
          <p>{c.income}</p>
          <h3 style={{ marginTop: 20 }}>Основни рискове</h3>
          <ul className="risks">{c.risks.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      </section>

      <section className="sector">
        <h2>Проекти в секцията</h2>
        <div className="cards">
          {list.map((p) => <ProjectCard key={p.id} p={p} />)}
          <div className="pcard soon">
            <div className="pc-body">
              <div className="eyebrow">За собственици на проекти</div>
              <h3>Търсиш финансиране в „{c.name}“?</h3>
              <p className="muted small">Изпрати проекта си за проверка. При одобрение го обявяваме за набиране до 5 000 000 € за 12 месеца.</p>
              <Link className="btn sm" href={'/owners?cat=' + c.slug}>Предложи проект</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
