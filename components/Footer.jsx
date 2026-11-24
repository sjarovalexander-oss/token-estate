'use client';
import Link from 'next/link';
import { usePrefs, CONTACT } from '../lib/brand';

export default function Footer() {
  const pr = usePrefs();
  const en = pr.lang === 'en';
  return (
    <footer className="foot">
      <div className="foot-links">
        <b>{pr.name}</b>
        <Link href="/partners">{en ? 'For partners' : 'За партньори'}</Link>
        <Link href="/statistics">{en ? 'Project statistics' : 'Статистика за проектите'}</Link>
        <Link href="/owners">{en ? 'For owners' : 'За собственици'}</Link>
        <Link href="/market">{en ? 'Bulletin board' : 'Табло за обяви'}</Link>
        <a href={'mailto:' + CONTACT.email}>{CONTACT.email}</a>
        <a href={'tel:' + CONTACT.tel}>{CONTACT.phone}</a>
      </div>
      {en
        ? 'Demo version. All projects, people, prices and returns are fictional and for illustration only. Offering such investments to the public requires authorisation as a crowdfunding service provider under Regulation (EU) 2020/1503. Returns are forecasts, not guarantees.'
        : 'Демонстрационна версия. Всички проекти, лица, цени и доходности са измислени за илюстрация. Реалното предлагане на такива инвестиции изисква лиценз от КФН по Регламент (ЕС) 2020/1503. Доходността е прогноза, а не гаранция.'}
    </footer>
  );
}
