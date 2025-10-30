export interface BizEntry {
  alias: string;
  fakeid: string;
  nickname: string;
  round_head_img: string;
  service_type: number;
  signature: string;
}


export async function getBizEntry(fakeid: string): Promise<BizEntry | null> {
  const kv = useStorage('kv')
  return await kv.get<BizEntry>(`biz:${fakeid}`)
}
