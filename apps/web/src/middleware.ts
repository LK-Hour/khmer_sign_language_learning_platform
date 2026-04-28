import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // Define supported locales
    locales: ['en', 'km', 'fr'],
    // Default locale
    defaultLocale: 'en'
});

// Apply middleware to every request (exclude API routes, static files)
export const config = {
    matcher: ['/((?!api|_next/).*)'],
};
