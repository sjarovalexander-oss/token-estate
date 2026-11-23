'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useStore } from './providers';
import ProjectCard from '../components/ProjectCard';
import { CATS, PROJECTS, eur, last } from '../lib/data';

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

  // продажби на живо в случаен проект
  useEffect(() => {
    const i = setInterval(() => {
      const p = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
      if (Math.random() < 0.6) tick(p.id);
    }, 3000);
    return () => clearInterval(i);
  }, [tick]);

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
            <div className="card kpi"><span>Секции</span><b>{CATS.length}</b></div>
            <div className="card kpi"><span>Набрани досега</span><b className="gold">{eur(raised)}</b></div>
            <div className="card kpi"><span>Обща цел</span><b>{eur(goal)}</b></div>
          </div>
          <div className="row">
            <a className="btn" href="#sections">Разгледай секциите</a>
            <Link className="btn ghost lg" href="/profile">Моят профил</Link>
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

      <nav className="chips" id="sections">
        {CATS.map((c) => (
          <a key={c.slug} href={'#' + c.slug}>{c.icon} {c.name}</a>
        ))}
      </nav>

      {CATS.map((c) => (
        <section key={c.slug} id={c.slug} className="sector">
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
                <Link className="btn ghost" href={'/sector/' + c.slug}>Предложи проект</Link>
              </div>
            </div>
          </div>
        </section>
      ))}

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
