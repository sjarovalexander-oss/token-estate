import './globals.css';
import Providers from './providers';
import Nav from '../components/Nav';

export const metadata = {
  title: 'TokenEstate · демо платформа за токенизация на имоти',
  description: 'Демо: шест секции за финансиране с токени – сгради, соларна енергия, имоти под наем, ремонти, хотели и земя.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
          <footer className="foot">
            Демонстрационна версия. Всички проекти, лица, цени и доходности са измислени за илюстрация. Реалното предлагане
            на такива инвестиции изисква лиценз от КФН по Регламент (ЕС) 2020/1503. Доходността е прогноза, а не гаранция.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
