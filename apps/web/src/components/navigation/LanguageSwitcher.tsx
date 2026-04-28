'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher(): JSX.Element {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string): void => {
    // Replace current locale in pathname
    // /dashboard -> /km/dashboard or /km/dashboard -> /dashboard
    let newPathname = pathname;

    // Remove current locale prefix if it exists
    if (pathname.startsWith(`/${locale}/`)) {
      newPathname = pathname.slice(`/${locale}`.length);
    }

    // Add new locale prefix if not the default (en)
    if (newLocale !== 'en') {
      newPathname = `/${newLocale}${newPathname}`;
    }

    router.push(newPathname);
  };

  const otherLocale = locale === 'en' ? 'km' : 'en';
  const buttonLabel = otherLocale === 'km' ? 'ខ្មែរ' : 'English';
  const buttonTitle = otherLocale === 'km' ? 'Switch to Khmer' : 'Switch to English';

  return (
    <button
      onClick={() => switchLocale(otherLocale)}
      type="button"
      style={{
        border: '1px solid #d1d5db',
        background: '#fff',
        borderRadius: 8,
        padding: '0.4rem 0.75rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#475569',
      }}
      title={buttonTitle}
    >
      {buttonLabel}
    </button>
  );
}
