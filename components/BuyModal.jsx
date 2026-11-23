'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../app/providers';
import { eur, totalPer, retLabel, termLabel } from '../lib/data';

// Покупка в три стъпки: преглед, потвърждение на рисковете, сертификат
export default function BuyModal({ p, q, onClose }) {
  const { s, buyPrimary } = useStore();
  const [step, setStep] = useState(1);
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [cert] = useState(() => 'TE-' + p.id.slice(0, 3).toUpperCase() + '-' + Math.floor(100000 + Math.random() * 900000));
  const sum = q * p.price;
  return (
    <div className="modal-bg" onClick={step === 3 ? onClose : undefined}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="msteps">
          {['Преглед', 'Потвърждение', 'Готово'].map((t, i) => (
            <span key={t} className={step >= i + 1 ? 'on' : ''}><b>{i + 1}</b> {t}</span>
          ))}
        </div>
        {step === 1 && (
          <>
            <h3>{p.name}</h3>
            <table className="tbl">
              <tbody>
                <tr><td>Токени</td><td>{q} × {eur(p.price)}</td></tr>
                <tr className="hl"><td>Сума за плащане</td><td>{eur(sum)}</td></tr>
                <tr><td>Прогнозна доходност</td><td>{retLabel(p)}</td></tr>
                <tr><td>Очаквано общо за срока</td><td>{eur(q * totalPer(p))}</td></tr>
                <tr><td>Срок</td><td>{termLabel(p)}</td></tr>
                <tr><td>Портфейл след покупката</td><td>{eur(s.cash - sum)}</td></tr>
              </tbody>
            </table>
            <p className="muted small">Сумата отива в ескроу сметка и се връща изцяло, ако набирането не успее.</p>
            <div className="row end">
              <button className="btn ghost" onClick={onClose}>Отказ</button>
              <button className="btn sm" onClick={() => setStep(2)}>Продължи</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h3>Преди да потвърдиш</h3>
            <label className="chk"><input type="checkbox" checked={a} onChange={(e) => setA(e.target.checked)} /> Прочетох основния информационен документ за инвестицията (KIIS).</label>
            <label className="chk"><input type="checkbox" checked={b} onChange={(e) => setB(e.target.checked)} /> Разбирам, че доходността е прогноза и мога да загубя част от сумата или цялата.</label>
            <p className="muted small">Имаш 4 дни за размисъл, в които можеш да се откажеш без причина и без такса.</p>
            <div className="row end">
              <button className="btn ghost" onClick={() => setStep(1)}>Назад</button>
              <button className="btn sm" disabled={!a || !b} onClick={() => { buyPrimary(p.id, q); setStep(3); }}>Потвърди покупката за {eur(sum)}</button>
            </div>
          </>
        )}
        {step === 3 && (
          <div className="center-txt">
            <div className="okmark">✓</div>
            <h3>Вече притежаваш {q} {q === 1 ? 'токен' : 'токена'} от „{p.name}“</h3>
            <p className="muted">Сертификат за дял № <b className="gold">{cert}</b> (демо)</p>
            <div className="row end center">
              <button className="btn ghost" onClick={onClose}>Затвори</button>
              <Link className="btn sm" href="/profile">Към моя профил</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
