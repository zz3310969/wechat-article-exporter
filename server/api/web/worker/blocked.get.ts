/**
 * 查询公共代理状态
 */
import { EXTERNAL_API_SERVICE } from '~/config';

export default defineEventHandler(async event => {
  return await fetch(`https://api.cloudflare.com/client/v4/accounts/{account_id}/rules/lists`).then(res => res.json());
});
