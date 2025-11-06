import { type CookieEntity } from '~/server/utils/CookieStore';

export type CookieKVKey = string;

export interface CookieKVValue {
  token: string;
  cookies: CookieEntity[];
}

export async function setMpCookie(key: CookieKVKey, data: CookieKVValue): Promise<boolean> {
  const kv = useStorage('kv');
  await kv.set<CookieKVValue>(`cookie:${key}`, data, {
    // https://developers.cloudflare.com/kv/api/write-key-value-pairs/#expiring-keys
    expirationTtl: 60 * 60 * 24 * 4, // 4 days
  });
  return true;
}

export async function getMpCookie(key: CookieKVKey): Promise<CookieKVValue | null> {
  const kv = useStorage('kv');
  return await kv.get<CookieKVValue>(`cookie:${key}`);
}
