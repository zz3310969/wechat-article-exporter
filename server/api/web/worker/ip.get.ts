/**
 * 查询公共代理状态
 */

interface NameQuery {
  name: string;
}

export default defineEventHandler(async event => {
  const { name } = getQuery<NameQuery>(event);
  return await fetch(`https://my-cron-service.deno.dev/api/worker-security?name=${name}`).then(res => res.json());
});
