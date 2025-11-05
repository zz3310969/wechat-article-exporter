// server/api/sentry-test.post.ts
export default defineEventHandler(async event => {
  console.log('[API] Entering sentry-test');
  import('@sentry/nuxt')
    .then(({ captureException }) => {
      captureException(new Error('Manual server error test'));
      console.log('[API] Sentry capture called');
    })
    .catch(err => console.error('[API] Import failed:', err));
  return { status: 'ok' };
});
