'use client';
import { useState } from 'react';
import { eur } from '../lib/data';

// Тест за знания и симулация на загуба преди първата инвестиция
// (за непрофесионални инвеститори по Регламент (ЕС) 2020/1503)
const QS = [
  {
    q: 'Какво става с парите ти, ако проектът се провали?',
    a: ['Връщат се изцяло от платформата', 'Може да загубя част от тях или всичките', 'Покриват се от държавен фонд'],
    ok: 1,
  },
  {
    q: 'Гарантирана ли е доходността, посочена при проекта?',
    a: ['Да, тя е договорена', 'Не, това е прогноза', 'Да, ако проектът е обезпечен'],
    ok: 1,
  },
  {
    q: 'Мога ли да изтегля парите си по всяко време?',
    a: ['Да, по всяко време', 'Само ако някой купи токените ми, и то на договорена цена', 'Да, с такса 1%'],
    ok: 1,
  },
  {
    q: 'Защо е добре да разпределиш сумата в няколко проекта?',
    a: ['Така рискът от един проект тежи по-малко', 'Така доходността е гарантирана', 'Няма значение'],
    ok: 0,
  },
];

export function TestPanel({ onDone, onCancel }) {
  const [ans, setAns] = useState({});
  const [nw, setNw] = useState(40000);
  const [step, setStep] = useState(0);
  const done = Object.keys(ans).length === QS.length;
  const score = QS.filter((x, i) => ans[i] === x.ok).length;
  if (step === 0)
    return (
      <div className="cp">
        <div className="cp-badge">Задължително преди първата инвестиция</div>
        <h3>Тест за знания</h3>
        <p className="muted small">Четири кратки въпроса, за да е сигурно, че разбираш рисковете. Попълва се веднъж.</p>
        {QS.map((x, i) => (
          <div key={i} className="cp-q">
            <b>{i + 1}. {x.q}</b>
            <div className="cp-a">
              {x.a.map((t, j) => (
                <button key={j} className={ans[i] === j ? (j === x.ok ? 'on ok' : 'on no') : ''} onClick={() => setAns((s) => ({ ...s, [i]: j }))}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="row end">
          {onCancel && <button className="btn ghost" onClick={onCancel}>Отказ</button>}
          <button className="btn sm" disabled={!done} onClick={() => setStep(1)}>Продължи</button>
        </div>
      </div>
    );
  return (
    <div className="cp">
      <div className="cp-badge">Стъпка 2 от 2</div>
      <h3>Колко загуба можеш да понесеш?</h3>
      <p className="muted small">Посочи приблизителното си нетно имущество: годишен доход и спестявания минус задълженията. Не се проверява и не се споделя.</p>
      <label>Нетно имущество: <b>{eur(nw)}</b></label>
      <input type="range" min="5000" max="500000" step="5000" value={nw} onChange={(e) => setNw(+e.target.value)} />
      <div className="cp-sim">
        <div><span>Можеш да понесеш загуба до</span><b>{eur(nw * 0.1)}</b><em>10% от нетното имущество</em></div>
        <div><span>Препоръчителен лимит за един проект</span><b>{eur(nw * 0.05)}</b><em>5% от нетното имущество</em></div>
      </div>
      <p className={score === QS.length ? 'ok small' : 'warn-txt small'}>
        {score === QS.length ? `✓ Верни отговори: ${score} от ${QS.length}. Можеш да продължиш.` : `Верни отговори: ${score} от ${QS.length}. Инвестициите може да не са подходящи за теб. Можеш да продължиш, след като потвърдиш, че разбираш рисковете.`}
      </p>
      <div className="row end">
        <button className="btn ghost" onClick={() => setStep(0)}>Назад</button>
        <button className="btn sm" onClick={() => onDone({ tested: true, score, netWorth: nw })}>Запази и продължи</button>
      </div>
    </div>
  );
}

export const needsLimit = (amount, inv) => amount > 1000 || (inv && inv.netWorth && amount > inv.netWorth * 0.05);

export function LimitWarning({ amount, inv, checked, onChange }) {
  const pct = inv && inv.netWorth ? (amount / inv.netWorth) * 100 : null;
  return (
    <div className="cp-warn">
      <b>⚠ Предупреждение за размера на инвестицията</b>
      <p>
        Влагаш {eur(amount)}
        {pct !== null ? `, което е ${pct.toFixed(1)}% от посоченото ти нетно имущество` : ''}. Сумата е над 1 000 €
        {pct !== null && pct > 5 ? ' и над 5% от нетното ти имущество' : ''}. Може да загубиш част от нея или цялата.
      </p>
      <label className="chk"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> Получих предупреждението и разбирам риска.</label>
    </div>
  );
}
