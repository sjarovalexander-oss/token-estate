'use client';
import { useEffect, useState } from 'react';

import { BRAND, CONTACT } from './brand-name';
export { BRAND, CONTACT };

export const THEMES = [
  { id: 'gold', bg: 'Злато', en: 'Gold', v: { '--gold': '#d8b36a', '--gold2': '#f3d9a0', '--bg': '#080b12', '--panel': '#111726', '--panel2': '#161e31', '--line': '#232d45' } },
  { id: 'emerald', bg: 'Изумруд', en: 'Emerald', v: { '--gold': '#3fbf8f', '--gold2': '#9fe8c8', '--bg': '#06100d', '--panel': '#0e1a16', '--panel2': '#13221d', '--line': '#1f3a31' } },
  { id: 'sapphire', bg: 'Сапфир', en: 'Sapphire', v: { '--gold': '#5b9dff', '--gold2': '#b5d3ff', '--bg': '#060a14', '--panel': '#0e1526', '--panel2': '#131c33', '--line': '#22305a' } },
  { id: 'bordeaux', bg: 'Бордо', en: 'Bordeaux', v: { '--gold': '#d9727f', '--gold2': '#f5bcc4', '--bg': '#10070a', '--panel': '#1c0f13', '--panel2': '#25141a', '--line': '#3d2229' } },
];

const KEY = 'te-prefs';
const EV = 'te-prefs';
const DEF = { name: BRAND.name, theme: 'gold', lang: 'bg' };

function read() {
  try {
    return { ...DEF, ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
  } catch (e) {
    return DEF;
  }
}

export function setPrefs(x) {
  const n = { ...read(), ...x };
  try {
    localStorage.setItem(KEY, JSON.stringify(n));
  } catch (e) {}
  applyTheme(n.theme);
  window.dispatchEvent(new Event(EV));
}

export function applyTheme(id) {
  const t = THEMES.find((x) => x.id === id) || THEMES[0];
  const r = document.documentElement;
  Object.entries(t.v).forEach(([k, v]) => r.style.setProperty(k, v));
  r.dataset.theme = t.id;
}

export function usePrefs() {
  const [p, setP] = useState(DEF);
  useEffect(() => {
    const on = () => setP(read());
    on();
    window.addEventListener(EV, on);
    window.addEventListener('storage', on);
    return () => {
      window.removeEventListener(EV, on);
      window.removeEventListener('storage', on);
    };
  }, []);
  return p;
}

// t('текст', 'text') — избира според езика
export function useT() {
  const { lang } = usePrefs();
  return (bg, en) => (lang === 'en' ? en : bg);
}

// „TokenEstate“ → Token + <b>Estate</b>
export function splitName(n) {
  const m = (n || '').match(/^([A-ZА-Я]?[^A-ZА-Я]*)([A-ZА-Я].*)$/);
  return m && m[1] ? [m[1], m[2]] : ['', n || BRAND.name];
}

// Английски имена на секциите
export const CATS_EN = {
  stroitelstvo: { name: 'New construction', lead: 'Fund the construction of a residential building and receive a fixed profit when the flats are sold.', term: '18–30 months' },
  energia: { name: 'Solar energy and batteries', lead: 'A share of a solar park with a battery. Income comes from the electricity sold and is paid every quarter.', term: '5–10 years' },
  naem: { name: 'Rental property', lead: 'Finished warehouses, offices and homes with tenants. You receive your share of the rent without managing a property.', term: '4–7 years' },
  remont: { name: 'Renovate and resell', lead: 'Old flats in good locations are bought, renovated and sold. The shortest term on the platform.', term: '6–12 months' },
  hoteli: { name: 'Hotels and tourism', lead: 'A share of the revenue of an operating hotel, plus an investor perk: free nights every year.', term: '5–8 years' },
  zemia: { name: 'Farmland', lead: 'Fields and lavender plantations in Dobrudzha, leased to farmers. The lowest risk and the steadiest return.', term: '7–10 years' },
};

// Бележка в английски режим за страници, които още са само на български
export function EnNote() {
  const { lang } = usePrefs();
  if (lang !== 'en') return null;
  return <div className="en-note">This page of the demo is in Bulgarian. The home page, partner page and statistics are available in English; the full English version is delivered with the white-label setup.</div>;
}
