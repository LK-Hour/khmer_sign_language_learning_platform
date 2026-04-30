// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'kh'],
  defaultLocale: 'kh',
  localePrefix: 'always',
});

// Export these specific hooks!
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);