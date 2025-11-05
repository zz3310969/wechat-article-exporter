import { getMpToken } from '~/server/kv/token';

export default defineEventHandler(async event => {
  return await getMpToken();
});
