/**
 * 查询公共代理状态
 *
 * 数据由托管在 Deno Deploy 上面的 [my-cron-service 项目](https://dash.deno.com/projects/my-cron-service) 提供
 */
import { EXTERNAL_API_SERVICE } from '~/config';

export default defineEventHandler(async event => {
  return await fetch(`${EXTERNAL_API_SERVICE}/api/worker-metrics?key=worker-metrics`).then(res => res.json());
});
