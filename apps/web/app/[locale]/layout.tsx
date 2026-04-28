import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import AppNavbar from '@/components/navigation/AppNavbar';
import { ThemeProviders } from '@/app/providers';

export const metadata: Metadata = {
  title: 'KSL Learning Platform',
  description: 'Khmer Sign Language learning platform',
};

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps): Promise<JSX.Element> {
  // Await params (Next.js 16.2.4+)
  const { locale } = await params;

  return (
    <ThemeProviders>
      <AppNavbar />
      {children}
    </ThemeProviders>
  );
}
