// Всички данни са измислени и служат само за демонстрация.
export const P = {
  name: 'Резиденция „Тракия Парк“',
  city: 'Пловдив, кв. Тракия',
  spv: '„Тракия Парк Проект“ ЕООД (SPV)',
  builder: '„Строй Инвест Пловдив“ ООД',
  apts: 30,
  floors: 6,
  perFloor: 5,
  area: 2400,
  cost: 2400000,
  revenue: 3360000,
  tokens: 200,
  price: 5000,
  payout: 6000,
  months: 24,
  ownFunds: 600000,
  bank: 800000,
  feeRaise: 0.04,
  feeProfit: 0.1,
  feeTrade: 0.01,
};

export const STAGES = [
  { k: 'Набиране', short: 'Набиране', month: 0, fair: 5000 },
  { k: 'Старт на строежа', short: 'Старт', month: 2, fair: 5050 },
  { k: 'Акт 14 · груб строеж', short: 'Акт 14', month: 10, fair: 5300 },
  { k: 'Акт 15 · завършена сграда', short: 'Акт 15', month: 16, fair: 5500 },
  { k: 'Акт 16 · разрешение за ползване', short: 'Акт 16', month: 19, fair: 5700 },
  { k: 'Продажби и изплащане', short: 'Изплащане', month: 24, fair: 5900 },
];

export const TRANCHES = [
  { name: 'Транш 1 · старт на строежа', pct: 20, stage: 1 },
  { name: 'Транш 2 · кота нула', pct: 20, stage: 1 },
  { name: 'Транш 3 · Акт 14', pct: 25, stage: 2 },
  { name: 'Транш 4 · Акт 15', pct: 20, stage: 3 },
  { name: 'Транш 5 · Акт 16', pct: 15, stage: 4 },
];

export function fairValue(s) {
  const base = STAGES[s.stage].fair;
  const extra = s.stage === 5 ? Math.round((s.aptsSold / P.apts) * 100) : 0;
  return Math.min(P.payout, base + extra);
}

export const eur = (n) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ' €';

const today = () => new Date().toLocaleDateString('bg-BG');

export function initState() {
  return {
    v: 1,
    sold: 137,
    mine: 3,
    cash: 40000,
    stage: 0,
    aptsSold: 0,
    deadline: Date.now() + 21 * 864e5,
    fees: 0,
    listings: [
      { id: 1, seller: 'Инвеститор #041', qty: 2, off: -60 },
      { id: 2, seller: 'Инвеститор #112', qty: 1, off: 20 },
      { id: 3, seller: 'Инвеститор #007', qty: 4, off: 80 },
      { id: 4, seller: 'Инвеститор #093', qty: 1, off: 150 },
      { id: 5, seller: 'Инвеститор #158', qty: 3, off: 240 },
    ],
    trades: [],
    tx: [{ d: today(), t: 'Покупка · първичен пазар', qty: 3, price: 5000 }],
    news: [
      { d: today(), t: 'Кампанията е открита. Котва-инвеститорът (строителят) закупи първите 40 токена.' },
      { d: today(), t: 'Публикувани са разрешението за строеж и независимата оценка на бюджета.' },
    ],
    released: [false, false, false, false, false],
    investors: [
      { n: 'Строй Инвест Пловдив ООД (котва)', tok: 40, kyc: true },
      { n: 'Иван П.', tok: 12, kyc: true },
      { n: 'Мария Д.', tok: 8, kyc: true },
      { n: 'Георги С.', tok: 20, kyc: true },
      { n: 'Елена К.', tok: 5, kyc: false },
      { n: 'Николай Т.', tok: 15, kyc: true },
      { n: 'Десислава М.', tok: 2, kyc: false },
      { n: 'Петър В.', tok: 10, kyc: true },
    ],
  };
}
