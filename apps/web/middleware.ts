import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['km', 'en'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Khmer-first strategy: default to Khmer if no locale in URL
  localePrefix: 'as-needed',
});

export const config = {
  // Match all pathnames except for:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
