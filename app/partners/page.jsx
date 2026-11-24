'use client';
import Link from 'next/link';
import { usePrefs, CONTACT } from '../../lib/brand';
import { Reveal } from '../../components/Bits';

const MODULES = [
  ['🏗', 'Шест секции за финансиране', 'Six financing sections', 'Сгради, соларна енергия, имоти под наем, ремонти, хотели, земя. Всяка с филм, етапи и калкулатор.', 'Buildings, solar, rentals, renovations, hotels, land. Each with a film, stages and a calculator.', '/'],
  ['🧾', 'Покупка с регулаторни стъпки', 'Purchase with regulatory steps', 'Тест за знания, симулация на загуба, предупреждение над 1 000 € или 5% от нетното имущество, KIIS и 4 дни за размисъл.', 'Knowledge test, loss simulation, warning above €1,000 or 5% of net worth, KIIS and a 4-day reflection period.', '/project/trakia'],
  ['📊', 'Сглобяване на портфейл', 'Portfolio builder', 'Инвеститорът избира профил на риск и сума, платформата разпределя между проектите.', 'The investor picks a risk profile and amount; the platform spreads it across projects.', '/portfolio'],
  ['📋', 'Табло за обяви между инвеститори', 'Investor bulletin board', 'Обяви за прехвърляне на токени с ориентировъчна стойност. Не е място за търговия.', 'Listings to transfer tokens with an indicative value. Not a trading venue.', '/market'],
  ['👤', 'Профил на инвеститора', 'Investor profile', 'Притежания, предстоящи плащания, снимки по етапи, история и документи.', 'Holdings, upcoming payouts, stage photos, history and documents.', '/profile'],
  ['🏢', 'Кандидатстване за собственици', 'Project owner applications', 'Собственикът подава проект, вижда разходите и преглед на страницата си.', 'Owners submit a project, see the costs and a live preview of their page.', '/owners'],
  ['🛠', 'Контролен център', 'Control centre', 'Одобряване на проекти и KYC, етапи, освобождаване на траншове, новини, приходи.', 'Approve projects and KYC, move stages, release tranches, post news, track revenue.', '/admin'],
  ['📈', 'Статистика за проектите', 'Project statistics', 'Годишна публикация на изплатени, забавени и проекти в неизпълнение.', 'Yearly disclosure of repaid, delayed and defaulted projects.', '/statistics'],
];

const SPLIT = [
  ['Лиценз от КФН и надзор', 'FSC licence and supervision', 'партньор', 'partner'],
  ['Подбор и проверка на проектите', 'Project selection and due diligence', 'партньор', 'partner'],
  ['KYC/AML решения и отговорност', 'KYC/AML decisions and liability', 'партньор', 'partner'],
  ['KIIS, договори, общи условия', 'KIIS, contracts, terms', 'партньор', 'partner'],
  ['Връзка с инвеститорите и маркетинг', 'Investor relations and marketing', 'партньор', 'partner'],
  ['Платформа, дизайн и филми', 'Platform, design and films', 'ние', 'us'],
  ['Интеграции с доставчици', 'Integrations with providers', 'ние', 'us'],
  ['Хостинг, сигурност, поддръжка', 'Hosting, security, maintenance', 'ние', 'us'],
  ['Нови функции по заявка', 'New features on request', 'ние', 'us'],
];

const INTEG = [
  ['KYC / проверка на самоличност', 'KYC / identity verification', 'по избор на партньора', "the partner's chosen provider"],
  ['Ескроу или платежна сметка', 'Escrow or payment account', 'банка или платежна институция на партньора', "the partner's bank or payment institution"],
  ['Картови плащания и банкови преводи', 'Card payments and bank transfers', 'платежен доставчик', 'payment provider'],
  ['Регистър на дяловете', 'Register of holdings', 'вътрешен регистър, а при нужда токени във верига', 'internal register, optionally on-chain tokens'],
  ['Счетоводство и отчети към КФН', 'Accounting and FSC reporting', 'експорт на данни', 'data export'],
];

const STEPS = [
  ['Седмица 1–2', 'Weeks 1–2', 'Марка, цветове, текстове и първите реални проекти', 'Brand, colours, copy and the first real projects'],
  ['Седмица 3–6', 'Weeks 3–6', 'Интеграции: KYC, плащания, ескроу', 'Integrations: KYC, payments, escrow'],
  ['Седмица 7–8', 'Weeks 7–8', 'Тестове, правен преглед от партньора, обучение на екипа', "Testing, partner's legal review, team training"],
  ['Седмица 9+', 'Week 9+', 'Пускане и поддръжка', 'Launch and maintenance'],
];

export default function Partners() {
  const pr = usePrefs();
  const en = pr.lang === 'en';
  const t = (b, e) => (en ? e : b);
  return (
    <>
      <section className="pt-hero">
        <div className="eyebrow">{t('За лицензирани доставчици на услуги за колективно финансиране', 'For licensed crowdfunding service providers')}</div>
        <h1>{t('Вашият лиценз. Нашата технология.', 'Your licence. Our technology.')}</h1>
        <p className="lead">
          {t(
            `${pr.name} е готова платформа за финансиране на реални активи с токени. Предлагаме я под вашата марка: вие запазвате лиценза, решенията и клиентите, а ние поемаме технологията.`,
            `${pr.name} is a ready-made platform for financing real assets with tokens. We offer it under your brand: you keep the licence, the decisions and the clients; we handle the technology.`
          )}
        </p>
        <div className="row">
          <Link className="btn" href="/">{t('Разгледай демото', 'Explore the demo')}</Link>
          <a className="btn ghost" href="#contact">{t('Контакт', 'Contact')}</a>
        </div>
        <p className="muted small">{t('Демото е оптимизирано за компютър. Натисни „Тема“ горе, за да видиш платформата със своите цветове и име.', 'The demo is optimised for desktop. Press “Theme” at the top to see the platform with your colours and name.')}</p>
      </section>

      <section>
        <h2>{t('Какво получавате', 'What you get')}</h2>
        <div className="pt-mods">
          {MODULES.map(([ic, b, e, db, de, href]) => (
            <Reveal key={b} as="div">
              <Link href={href} className="card pt-mod">
                <span className="pt-ic">{ic}</span>
                <b>{t(b, e)}</b>
                <p className="muted small">{t(db, de)}</p>
                <em>{t('Виж в демото →', 'See it in the demo →')}</em>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="two">
        <div className="card">
          <h3>{t('Кой за какво отговаря', 'Who is responsible for what')}</h3>
          <table className="tbl">
            <tbody>
              {SPLIT.map(([b, e, wb, we]) => (
                <tr key={b}><td>{t(b, e)}</td><td><span className={'tag ' + (wb === 'ние' ? 'ok' : 'warn')}>{t(wb, we)}</span></td></tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">{t('Платформата е технологичен доставчик. Регулираната дейност остава изцяло при лицензирания оператор.', 'The platform is a technology provider. All regulated activity stays with the licensed operator.')}</p>
        </div>
        <div className="card">
          <h3>{t('Интеграции', 'Integrations')}</h3>
          <table className="tbl">
            <tbody>
              {INTEG.map(([b, e, wb, we]) => (
                <tr key={b}><td>{t(b, e)}</td><td className="muted">{t(wb, we)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">{t('Свързваме се с доставчиците, с които вече работите.', 'We connect to the providers you already work with.')}</p>
        </div>
      </section>

      <section className="card">
        <h3>{t('Примерен график', 'Indicative timeline')}</h3>
        <div className="pt-steps">
          {STEPS.map(([b, e, db, de], i) => (
            <div key={b} className="pt-step">
              <span>{i + 1}</span>
              <b>{t(b, e)}</b>
              <p className="muted small">{t(db, de)}</p>
            </div>
          ))}
        </div>
        <p className="muted small">{t('Срокът е наша приблизителна оценка и зависи от избраните доставчици и правния преглед.', 'Our rough estimate; it depends on the chosen providers and the legal review.')}</p>
      </section>

      <section className="two">
        <div className="card">
          <h3>{t('Модел на сътрудничество', 'How we work together')}</h3>
          <ul className="pt-list">
            <li>{t('Еднократна такса за внедряване и брандиране', 'One-off fee for setup and branding')}</li>
            <li>{t('Месечна такса за хостинг, поддръжка и обновления', 'Monthly fee for hosting, maintenance and updates')}</li>
            <li>{t('Възможност за дял от приходите вместо част от таксите', 'Option for a revenue share instead of part of the fees')}</li>
          </ul>
          <p className="muted small">{t('Цените са по договаряне според обема и нужните интеграции.', 'Pricing is agreed based on volume and required integrations.')}</p>
        </div>
        <div className="card" id="contact">
          <h3>{t('Контакт', 'Contact')}</h3>
          <div className="pt-contact">
            <span className="pr-avatar">АС</span>
            <div>
              <b>{t('Александър Сяров', 'Alexander Syarov')}</b>
              <p className="muted small">{t('Технология и продукт', 'Technology and product')}</p>
            </div>
          </div>
          <div className="pt-cbtns">
            <a className="btn sm" href={'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent(t('Платформа за токенизация – среща', 'Tokenization platform – meeting'))}>✉ {CONTACT.email}</a>
            <a className="btn ghost sm" href={'tel:' + CONTACT.tel}>☎ {CONTACT.phone}</a>
          </div>
          <p className="muted small">{t('Ще се радваме на 30-минутна среща, за да покажем демото на живо и да обсъдим нуждите ви.', 'We would be glad to have a 30-minute call to walk you through the demo and discuss your needs.')}</p>
        </div>
      </section>
    </>
  );
}
