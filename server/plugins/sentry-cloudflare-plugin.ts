import { sentryCloudflareNitroPlugin } from '@sentry/nuxt/module/plugins';

const dsn = process.env.NUXT_PUBLIC_SENTRY_DSN;

// fetch(process.env.NUXT_TELEMETRY_URL as string, {
//   method: 'POST',
//   body: JSON.stringify({ dsn }, null, 2),
//   headers: {
//     'content-type': 'application/json',
//   },
// })
//   .then(result => result.text())
//   .then(text => {
//     console.log(text);
//   });

// export default defineNitroPlugin(
//   sentryCloudflareNitroPlugin({
//     dsn: dsn,
//     environment: process.env.NODE_ENV || 'development',
//
//     // Set tracesSampleRate to 1.0 to capture 100%
//     // of transactions for tracing.
//     // We recommend adjusting this value in production
//     // Learn more at
//     // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
//     tracesSampleRate: 1.0,
//
//     // Enable logs to be sent to Sentry
//     enableLogs: true,
//   })
// );

export default defineNitroPlugin(nitroApp => {
  console.log('[SENTRY PLUGIN] Loading sentryCloudflareNitroPlugin...'); // 日志 1: 进入插件

  const pluginConfig = {
    dsn: dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    enableLogs: true,
    debug: true,
  };

  if (!pluginConfig.dsn) {
    console.warn('[SENTRY PLUGIN] DSN missing, skipping init');
    return;
  }

  try {
    const sentryPlugin = sentryCloudflareNitroPlugin(pluginConfig);
    console.log('[SENTRY PLUGIN] sentryCloudflareNitroPlugin created successfully'); // 日志 2: 创建成功
    sentryPlugin(nitroApp); // 显式调用（如果模块支持）
    console.log('[SENTRY PLUGIN] Plugin hooked into Nitro'); // 日志 3: 钩子完成
  } catch (error) {
    console.error('[SENTRY PLUGIN] Init failed:', error); // 捕获错误
  }
});
