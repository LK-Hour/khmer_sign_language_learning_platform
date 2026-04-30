'use client';

import { useLocale } from 'next-intl';
// Import from your routing file, not 'next/navigation'
import { useRouter, usePathname } from '@/i18n/routing'; 
import React from 'react';

export default function LanguageSwitcher(): JSX.Element {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      // The 'router.push' from next-intl knows how to 
      // swap the locale prefix automatically.
      router.push(pathname, { locale: nextLocale });
    });
  };

  const otherLocale = locale === 'en' ? 'kh' : 'en';

  return (
    <button
      disabled={isPending}
      onClick={() => onSelectChange(otherLocale)}
      style={{ opacity: isPending ? 0.5 : 1 }}
    >
      {otherLocale === 'kh' ? 'English' : 'ខ្មែរ'}
    </button>
  );
}