'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FEE, PROJECTS, getP, fairValue, initState, last, today, syncCustom, makeProject, seedProj } from '../lib/data';

const Ctx = createContext(null);
const KEY = 'token-estate-demo-v3';

export function useStore() {
  return useContext(Ctx);
}

export default function Providers({ children }) {
  const [s, setS] = useState(null);

  useEffect(() => {
    let st = null;
    try {
      st = JSON.parse(localStorage.getItem(KEY));
    } catch (e) {}
    setS(st && st.v === 3 ? st : initState());
  }, []);

  useEffect(() => {
    if (!s) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
  }, [s]);

  const api = useMemo(() => {
    // fn(ps, s, p) връща { ps: промени по проекта, ...промени по общото състояние }
    const up = (pid, fn) =>
      setS((s) => {
        const p = getP(pid);
        const r = fn(s.proj[pid], s, p);
        if (!r) return s;
        const { ps, ...root } = r;
        return { ...s, ...root, proj: { ...s.proj, [pid]: { ...s.proj[pid], ...(ps || {}) } } };
      });
    const tx = (s, pid, t, qty, price) => [{ d: today(), pid, t, qty, price }, ...s.tx];
    return {
      buyPrimary: (pid, q) =>
        up(pid, (ps, s, p) => {
          const n = Math.min(q, p.tokens - ps.sold, Math.floor(s.cash / p.price));
          if (n <= 0 || ps.stage !== 0) return null;
          return {
            ps: { sold: ps.sold + n, mine: ps.mine + n },
            cash: s.cash - n * p.price,
            tx: tx(s, pid, 'Покупка · първичен пазар', n, p.price),
          };
        }),
      tick: (pid) => up(pid, (ps, s, p) => (ps.stage === 0 && ps.sold < p.tokens ? { ps: { sold: ps.sold + 1 } } : null)),
      complete: (pid) =>
        up(pid, (ps, s, p) => ({
          ps: { sold: p.tokens, stage: Math.max(1, ps.stage) },
          news: [{ d: today(), pid, t: 'Набирането приключи успешно. Средствата са в ескроу сметка.' }, ...s.news],
        })),
      setStage: (pid, i) =>
        up(pid, (ps, s, p) => ({ ps: { stage: i, sold: i > 0 ? p.tokens : ps.sold, prog: i < last(p) ? 0 : ps.prog } })),
      setProg: (pid, n) => up(pid, () => ({ ps: { prog: n } })),
      buyListing: (pid, id) =>
        up(pid, (ps, s, p) => {
          const l = ps.listings.find((x) => x.id === id);
          if (!l || l.mine) return null;
          const price = fairValue(p, ps) + l.off;
          const total = price * l.qty;
          if (s.cash < total) return null;
          return {
            ps: {
              mine: ps.mine + l.qty,
              fees: ps.fees + total * FEE.trade,
              listings: ps.listings.filter((x) => x.id !== id),
              trades: [...ps.trades, { price, qty: l.qty }],
            },
            cash: s.cash - total,
            tx: tx(s, pid, 'Покупка · вторичен пазар', l.qty, price),
          };
        }),
      listMine: (pid, qty, price) =>
        up(pid, (ps, s, p) => {
          const listed = ps.listings.filter((x) => x.mine).reduce((a, x) => a + x.qty, 0);
          if (qty <= 0 || qty > ps.mine - listed) return null;
          return { ps: { listings: [...ps.listings, { id: Date.now(), seller: 'Вие', qty, off: price - fairValue(p, ps), mine: true }] } };
        }),
      cancelListing: (pid, id) => up(pid, (ps) => ({ ps: { listings: ps.listings.filter((x) => x.id !== id) } })),
      botBuy: (pid, id) =>
        up(pid, (ps, s, p) => {
          const l = ps.listings.find((x) => x.id === id);
          if (!l || !l.mine) return null;
          const price = fairValue(p, ps) + l.off;
          const total = price * l.qty;
          const fee = total * FEE.trade;
          return {
            ps: {
              mine: ps.mine - l.qty,
              fees: ps.fees + fee,
              listings: ps.listings.filter((x) => x.id !== id),
              trades: [...ps.trades, { price, qty: l.qty }],
            },
            cash: s.cash + total - fee,
            tx: tx(s, pid, 'Продажба · вторичен пазар', l.qty, price),
          };
        }),
      release: (pid, i) => up(pid, (ps) => ({ ps: { released: ps.released.map((r, j) => (j === i ? true : r)) } })),
      addNews: (pid, t) => up(pid, (ps, s) => ({ news: [{ d: today(), pid, t }, ...s.news] })),
      buyMany: (list) =>
        setS((s) => {
          let cash = s.cash, txs = s.tx;
          const proj = { ...s.proj };
          list.forEach(({ pid, q }) => {
            const p = getP(pid), ps = proj[pid];
            const n = Math.min(q, p.tokens - ps.sold, Math.floor(cash / p.price));
            if (n <= 0 || ps.stage !== 0) return;
            proj[pid] = { ...ps, sold: ps.sold + n, mine: ps.mine + n };
            cash -= n * p.price;
            txs = [{ d: today(), pid, t: 'Покупка · първичен пазар', qty: n, price: p.price }, ...txs];
          });
          return { ...s, cash, tx: txs, proj };
        }),
      addApp: (a) => setS((s) => ({ ...s, apps: [{ ...a, id: Date.now(), status: 'new', d: today() }, ...s.apps] })),
      rejectApp: (id) => setS((s) => ({ ...s, apps: s.apps.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a)) })),
      approveApp: (id) =>
        setS((s) => {
          const a = s.apps.find((x) => x.id === id);
          if (!a || a.status !== 'new') return s;
          const p = makeProject(a);
          return {
            ...s,
            custom: [...s.custom, p],
            proj: { ...s.proj, [p.id]: seedProj(p, 3, 0) },
            apps: s.apps.map((x) => (x.id === id ? { ...x, status: 'approved', pid: p.id } : x)),
            news: [{ d: today(), pid: p.id, t: 'Проектът е одобрен и обявен за набиране.' }, ...s.news],
          };
        }),
      approveKyc: (i) => setS((s) => ({ ...s, investors: s.investors.map((x, j) => (j === i ? { ...x, kyc: true } : x)) })),
      reset: () => setS(initState()),
    };
  }, []);

  if (!s) return <div className="loading">Зареждане…</div>;
  syncCustom(s.custom);
  return <Ctx.Provider value={{ s, ...api }}>{children}</Ctx.Provider>;
}
