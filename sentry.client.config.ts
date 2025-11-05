import { useRuntimeConfig } from '#imports';
import * as Sentry from '@sentry/nuxt';

Sentry.init({
  dsn: useRuntimeConfig().public.sentry.dsn,
  environment: process.env.NODE_ENV || 'development',
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration({ router: useRouter() }), // 路由追踪
    Sentry.replayIntegration({
      // 会话重放
      maskAllText: false,
      blockAllMedia: false,
    }),

    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ],
  // Enable logs to be sent to Sentry
  enableLogs: true,
});
