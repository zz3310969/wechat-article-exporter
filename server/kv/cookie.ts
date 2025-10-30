export interface CookieEntry {
  key: string;
  token: string;
  cookie: string;
}

export async function getCookie(key: string): Promise<CookieEntry | null> {
  const kv = useStorage('kv');
  return await kv.get<CookieEntry>(`cookies:${key}`);
}

export async function setCookie(cookie: CookieEntry) {
  const kv = useStorage('kv');
  await kv.set<CookieEntry>(`cookies:${cookie.key}`, cookie, {
    expirationTtl: 60 * 60 * 24 * 3.8,
  });
  return true;
}
