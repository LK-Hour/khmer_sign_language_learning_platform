import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Define which locales are supported
  locales: ['en', 'km'],
  defaultLocale: 'en',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml).*)'],
};
