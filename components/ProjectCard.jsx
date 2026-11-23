'use client';
import Link from 'next/link';
import { useStore } from '../app/providers';
import { getC, eur, retLabel, termLabel } from '../lib/data';

export default function ProjectCard({ p }) {
  const { s } = useStore();
  const ps = s.proj[p.id];
  const c = getC(p.cat);
  const pct = (ps.sold / p.tokens) * 100;
  const status = ps.stage === 0 ? (ps.sold < p.tokens ? 'Набира средства' : 'Набран') : p.stages[ps.stage].short;
  return (
    <Link href={'/project/' + p.id} className={'pcard pc-' + p.scene}>
      <div className="pc-top">
        <span className="pc-icon">{c.icon}</span>
        <span className="tag ok">{status}</span>
      </div>
      <div className="pc-body">
        <div className="eyebrow">{p.loc}</div>
        <h3>{p.name}</h3>
        <p className="muted small">{p.tagline}</p>
        <div className="pc-nums">
          <div><span>Токен</span><b>{eur(p.price)}</b></div>
          <div><span>Доходност</span><b className="gold">{retLabel(p)}</b></div>
          <div><span>Срок</span><b>{termLabel(p)}</b></div>
        </div>
        <div className="bar"><i style={{ width: pct + '%' }} /></div>
        <div className="pc-foot">
          <span>{ps.sold} / {p.tokens} токена</span>
          <span className="gold">{eur(ps.sold * p.price)}</span>
        </div>
      </div>
    </Link>
  );
}
