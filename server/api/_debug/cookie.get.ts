import { getMpCookie } from '~/server/kv/cookie';

export default defineEventHandler(async event => {
  return await getMpCookie();
});
