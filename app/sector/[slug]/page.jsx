'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProjectCard from '../../../components/ProjectCard';
import { CATS, PROJECTS, getC, last } from '../../../lib/data';

const Scene3D = dynamic(() => import('../../../components/Scene3D'), { ssr: false });

export default function Sector() {
  const { slug } = useParams();
  const c = getC(slug);
  const [sent, setSent] = useState(false);
  if (!c) return <section className="card center"><h2>Няма такава секция</h2><Link className="btn sm" href="/">Към проектите</Link></section>;
  const list = PROJECTS.filter((p) => p.cat === c.slug);
  const feat = list[0];
  return (
    <>
      <nav className="chips">
        {CATS.map((x) => (
          <Link key={x.slug} href={'/sector/' + x.slug} className={x.slug === c.slug ? 'on' : ''}>{x.icon} {x.name}</Link>
        ))}
      </nav>

      <section className="hero">
        <div className="hero-txt">
          <div className="eyebrow">Секция</div>
          <h1>{c.icon} {c.name}</h1>
          <p className="lead">{c.lead}</p>
          <div className="kpis three">
            <div className="card kpi"><span>Типичен срок</span><b>{c.term}</b></div>
            <div className="card kpi"><span>Типична доходност</span><b className="gold">{c.ret}</b></div>
            <div className="card kpi"><span>Активни проекти</span><b>{list.length}</b></div>
          </div>
          <p className="muted small">Диапазоните са илюстрация за демото, а не пазарни данни или обещание.</p>
        </div>
        <div className="hero-3d">
          <Scene3D key={feat.scene} type={feat.scene} stage={last(feat)} frac={0.6} height={460} />
          <Link href={'/project/' + feat.id} className="stage-chip">{feat.name} · отвори проекта →</Link>
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
              {sent ? <p className="ok small">Заявката е записана (демо).</p> : <button className="btn sm" onClick={() => setSent(true)}>Предложи проект</button>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
