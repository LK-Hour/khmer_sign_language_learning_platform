import { NextRequest, NextResponse } from "next/server";

const PUBLIC_LOCALES = ["km", "en"];
const DEFAULT_LOCALE = "en";

// Use 'export default' for the proxy convention in Next.js 16
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Filter out static files and system paths
  if (pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url));
  }

  const pathnameHasLocale = PUBLIC_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)"],
};