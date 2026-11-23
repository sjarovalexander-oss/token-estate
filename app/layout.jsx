import './globals.css';
import Providers from './providers';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { BRAND } from '../lib/brand-name';

export const metadata = {
  title: BRAND.name + ' · демо платформа за токенизация на реални активи',
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
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
