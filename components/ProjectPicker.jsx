'use client';
import { useEffect, useState } from 'react';
import { PROJECTS, getC } from '../lib/data';

// Избор на проект; началната стойност идва от ?p= в адреса
export function usePicked() {
  const [pid, setPid] = useState(PROJECTS[0].id);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('p');
    if (q && PROJECTS.some((p) => p.id === q)) setPid(q);
  }, []);
  return [pid, setPid];
}

export default function ProjectPicker({ pid, setPid }) {
  return (
    <div className="chips">
      {PROJECTS.map((p) => (
        <button key={p.id} className={p.id === pid ? 'on' : ''} onClick={() => setPid(p.id)}>
          {p.name}
        </button>
      ))}
    </div>
  );
}
