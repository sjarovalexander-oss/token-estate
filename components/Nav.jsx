'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../app/providers';
import { eur, CATS } from '../lib/data';
import { usePreloadStatus } from '../lib/preload';
import { usePrefs, setPrefs, splitName } from '../lib/brand';
import BrandPanel from './BrandPanel';

const links = [
  ['/', 'Проекти', 'Projects'],
  ['/portfolio', 'Сглоби портфейл', 'Portfolio'],
  ['/market', 'Табло за обяви', 'Bulletin board'],
  ['/profile', 'Моят профил', 'My profile'],
  ['/owners', 'За собственици', 'For owners'],
  ['/admin', 'Админ панел', 'Admin'],
  ['/partners', 'За партньори', 'For partners'],
];

export default function Nav() {
  const path = usePathname();
  const { s } = useStore();
  const pr = usePrefs();
  const en = pr.lang === 'en';
  const [n1, n2] = splitName(pr.name);
  const pre = usePreloadStatus(CATS.map((c) => c.slug));
  // лента за зареждане: показва се веднага при клик върху вътрешен линк
  const [busy, setBusy] = useState(false);
  useEffect(() => setBusy(false), [path]);
  useEffect(() => {
    const on = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="/"]');
      if (a && !e.metaKey && !e.ctrlKey && a.getAttribute('href').split('?')[0].split('#')[0] !== window.location.pathname) setBusy(true);
    };
    document.addEventListener('click', on);
    return () => document.removeEventListener('click', on);
  }, []);
  return (
    <>
      {busy && <div className="navbar-busy" />}
      <div className="demo-bar">
        {en ? 'DEMO · fictional projects and figures · not an investment offer' : 'ДЕМО · измислени проекти и цифри · не е инвестиционно предложение'}
      </div>
      <header className="nav">
        <Link href="/" className="logo">
          <span className="logo-mark">◆</span> {n1}<b>{n2}</b>
        </Link>
        <nav>
          {links.map(([h, t, te]) => (
            <Link key={h} href={h} className={(h === '/' ? path === '/' || path.startsWith('/project') || path.startsWith('/sector') : path === h) ? 'on' : h === '/partners' ? 'hl' : ''}>
              {en ? te : t}
            </Link>
          ))}
        </nav>
        {pre.active && <div className="prestat">{en ? 'films' : 'филми'} {pre.done}/{pre.total}</div>}
        <div className="nav-tools">
          <BrandPanel />
          <button className="lang-btn" onClick={() => setPrefs({ lang: en ? 'bg' : 'en' })} title={en ? 'Български' : 'English'}>{en ? 'BG' : 'EN'}</button>
        </div>
        <div className="wallet">
          <span>{en ? 'Demo wallet' : 'Демо портфейл'}</span>
          <b>{eur(s.cash)}</b>
        </div>
      </header>
    </>
  );
}
