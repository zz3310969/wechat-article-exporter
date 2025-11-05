export async function setMpToken(data: Record<string, string>): Promise<boolean> {
  const kv = useStorage('kv');
  await kv.set<Record<string, string>>('tokens.json', data);
  return true;
}

export async function getMpToken(): Promise<Record<string, string> | null> {
  const kv = useStorage('kv');
  return await kv.get<Record<string, string>>('tokens.json');
}
