/**
 * 查询公共代理状态
 */
import { EXTERNAL_API_SERVICE } from '~/config';

interface NameQuery {
  name: string;
}

export default defineEventHandler(async event => {
  const { name } = getQuery<NameQuery>(event);
  return await fetch(`${EXTERNAL_API_SERVICE}/api/worker-security?name=${name}`).then(res => res.json());
});
