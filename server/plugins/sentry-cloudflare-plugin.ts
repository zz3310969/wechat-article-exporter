import { sentryCloudflareNitroPlugin } from '@sentry/nuxt/module/plugins';

const dsn = process.env.NUXT_PUBLIC_SENTRY_DSN;

fetch(process.env.NUXT_TELEMETRY_URL as string, {
  method: 'POST',
  body: JSON.stringify({ dsn }, null, 2),
  headers: {
    'content-type': 'application/json',
  },
})
  .then(result => result.text())
  .then(text => {
    console.log(text);
  });

export default defineNitroPlugin(
  sentryCloudflareNitroPlugin({
    dsn: dsn,
    environment: process.env.NODE_ENV || 'development',

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,

    // Enable logs to be sent to Sentry
    enableLogs: true,
  })
);
