import { sentryCloudflareNitroPlugin } from '@sentry/nuxt/module/plugins';
import * as Sentry from '@sentry/nuxt';

const dsn = process.env.NUXT_PUBLIC_SENTRY_DSN;

export default defineNitroPlugin(
  sentryCloudflareNitroPlugin({
    dsn: dsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    ],
    // Enable logs to be sent to Sentry
    enableLogs: true,

    // 可选：访问 nitroApp
    // (nitroApp: NitroApp) => ({ dsn: '...', tracesSampleRate: 0.2 })
  })
);
