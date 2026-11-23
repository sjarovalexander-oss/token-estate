'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../app/providers';
import { eur, CATS } from '../lib/data';
import { usePreloadStatus } from '../lib/preload';

const links = [
  ['/', 'Проекти'],
  ['/portfolio', 'Сглоби портфейл'],
  ['/market', 'Вторичен пазар'],
  ['/profile', 'Моят профил'],
  ['/owners', 'За собственици'],
  ['/admin', 'Админ панел'],
];

export default function Nav() {
  const path = usePathname();
  const { s } = useStore();
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
        ДЕМО · измислен проект и измислени цифри · не е инвестиционно предложение
      </div>
      <header className="nav">
        <Link href="/" className="logo">
          <span className="logo-mark">◆</span> Token<b>Estate</b>
        </Link>
        <nav>
          {links.map(([h, t]) => (
            <Link key={h} href={h} className={(h === '/' ? path === '/' || path.startsWith('/project') || path.startsWith('/sector') : path === h) ? 'on' : ''}>
              {t}
            </Link>
          ))}
        </nav>
        {pre.active && <div className="prestat">филми {pre.done}/{pre.total}</div>}
        <div className="wallet">
          <span>Демо портфейл</span>
          <b>{eur(s.cash)}</b>
        </div>
      </header>
    </>
  );
}
