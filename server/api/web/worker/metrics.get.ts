/**
 * 查询公共代理状态
 */

export default defineEventHandler(async event => {
  return await fetch('https://my-cron-service.deno.dev/api/worker-metrics?key=worker-metrics').then(res => res.json());
});
