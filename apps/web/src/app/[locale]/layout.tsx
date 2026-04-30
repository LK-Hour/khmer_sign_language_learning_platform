import type { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import AppNavbar from '@/components/navigation/AppNavbar';
import { ThemeProviders } from '@/app/providers';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps): Promise<JSX.Element> {
  const { locale } = await params;

  // 1. Validate the locale - if someone visits /fr/dashboard, show 404
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  // 2. Fetch the specific messages for this locale using your request.ts config
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          {/* 3. Wrap everything in the Intl Provider so 'useTranslations' works */}
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProviders>
              <AppNavbar />
              <main>{children}</main>
            </ThemeProviders>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}