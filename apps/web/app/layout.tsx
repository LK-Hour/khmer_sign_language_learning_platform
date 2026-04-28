import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'KSL Learning Platform',
  description: 'Khmer Sign Language learning platform',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps): Promise<JSX.Element> {
  // Get locale from the request (provided by next-intl middleware)
  // Use 'en' as fallback for non-locale-prefixed routes like /_not-found
  const locale = (await getLocale()) || 'en';

  return (
    <html suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
