import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CartProvider } from '../../contexts/cart.context';
import '../globals.css';

const locales = ['th', 'en'];

export const metadata: Metadata = {
  title: 'Eight Coffee Roasters — คั่วสด ส่งตรง',
  description: 'กาแฟคั่วสด Single Origin คุณภาพสูง จากไร่สู่แก้ว | Eight Coffee Roasters',
  keywords: ['กาแฟ', 'coffee', 'single origin', 'eight coffee roasters', 'กาแฟคั่วสด'],
  openGraph: {
    title: 'Eight Coffee Roasters',
    description: 'คั่วสดทุกล็อต ส่งตรงถึงมือคุณ',
    type: 'website',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=DM+Serif+Display:ital@0;1&family=Sarabun:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            {children}
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
