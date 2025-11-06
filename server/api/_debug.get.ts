import { cookieStore } from '~/server/utils/CookieStore';

export default defineEventHandler(async event => {
  return cookieStore.toJSON();
});
