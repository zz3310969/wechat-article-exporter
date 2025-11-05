import * as Sentry from '@sentry/nuxt';

if (process.env.NUXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  });
}
