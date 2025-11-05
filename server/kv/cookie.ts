import { type CookieEntity } from '~/server/utils/CookieStore';

export async function setMpCookie(data: Record<string, CookieEntity[]>): Promise<boolean> {
  const kv = useStorage('kv');
  await kv.set<Record<string, CookieEntity[]>>('cookies.json', data);
  return true;
}

export async function getMpCookie(): Promise<Record<string, CookieEntity[]> | null> {
  const kv = useStorage('kv');
  return await kv.get<Record<string, CookieEntity[]>>('cookies.json');
}
