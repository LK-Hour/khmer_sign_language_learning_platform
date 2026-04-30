// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except static files, API routes, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};