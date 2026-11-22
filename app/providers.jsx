'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { P, fairValue, initState } from '../lib/data';

const Ctx = createContext(null);
const KEY = 'token-estate-demo-v1';
const today = () => new Date().toLocaleDateString('bg-BG');

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
    setS(st && st.v === 1 ? st : initState());
  }, []);

  useEffect(() => {
    if (!s) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
  }, [s]);

  const api = useMemo(() => {
    const up = (fn) => setS((p) => ({ ...p, ...fn(p) }));
    return {
      buyPrimary: (q) =>
        up((p) => {
          const n = Math.min(q, P.tokens - p.sold, Math.floor(p.cash / P.price));
          if (n <= 0 || p.stage !== 0) return {};
          return {
            sold: p.sold + n,
            mine: p.mine + n,
            cash: p.cash - n * P.price,
            tx: [{ d: today(), t: 'Покупка · първичен пазар', qty: n, price: P.price }, ...p.tx],
          };
        }),
      tick: () => up((p) => (p.stage === 0 && p.sold < P.tokens ? { sold: p.sold + 1 } : {})),
      complete: () =>
        up((p) => ({
          sold: P.tokens,
          stage: Math.max(1, p.stage),
          news: [{ d: today(), t: 'Набирането приключи успешно: 200 от 200 токена. Средствата са в ескроу сметка.' }, ...p.news],
        })),
      setStage: (i) => up((p) => ({ stage: i, sold: i > 0 ? P.tokens : p.sold, aptsSold: i < 5 ? 0 : p.aptsSold })),
      setApts: (n) => up(() => ({ aptsSold: n })),
      buyListing: (id) =>
        up((p) => {
          const l = p.listings.find((x) => x.id === id);
          if (!l || l.mine) return {};
          const price = fairValue(p) + l.off;
          const total = price * l.qty;
          if (p.cash < total) return {};
          return {
            cash: p.cash - total,
            mine: p.mine + l.qty,
            fees: p.fees + total * P.feeTrade,
            listings: p.listings.filter((x) => x.id !== id),
            trades: [...p.trades, { price, qty: l.qty }],
            tx: [{ d: today(), t: 'Покупка · вторичен пазар', qty: l.qty, price }, ...p.tx],
          };
        }),
      listMine: (qty, price) =>
        up((p) => {
          const listed = p.listings.filter((x) => x.mine).reduce((a, x) => a + x.qty, 0);
          if (qty <= 0 || qty > p.mine - listed) return {};
          return { listings: [...p.listings, { id: Date.now(), seller: 'Вие', qty, off: price - fairValue(p), mine: true }] };
        }),
      cancelListing: (id) => up((p) => ({ listings: p.listings.filter((x) => x.id !== id) })),
      botBuy: (id) =>
        up((p) => {
          const l = p.listings.find((x) => x.id === id);
          if (!l || !l.mine) return {};
          const price = fairValue(p) + l.off;
          const total = price * l.qty;
          const fee = total * P.feeTrade;
          return {
            cash: p.cash + total - fee,
            mine: p.mine - l.qty,
            fees: p.fees + fee,
            listings: p.listings.filter((x) => x.id !== id),
            trades: [...p.trades, { price, qty: l.qty }],
            tx: [{ d: today(), t: 'Продажба · вторичен пазар', qty: l.qty, price }, ...p.tx],
          };
        }),
      release: (i) => up((p) => ({ released: p.released.map((r, j) => (j === i ? true : r)) })),
      approveKyc: (i) => up((p) => ({ investors: p.investors.map((x, j) => (j === i ? { ...x, kyc: true } : x)) })),
      addNews: (t) => up((p) => ({ news: [{ d: today(), t }, ...p.news] })),
      reset: () => setS(initState()),
    };
  }, []);

  if (!s) return <div className="loading">Зареждане…</div>;
  return <Ctx.Provider value={{ s, ...api }}>{children}</Ctx.Provider>;
}
