'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../app/providers';
import { eur } from '../lib/data';

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
  return (
    <>
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
        <div className="wallet">
          <span>Демо портфейл</span>
          <b>{eur(s.cash)}</b>
        </div>
      </header>
    </>
  );
}
