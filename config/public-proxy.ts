/**
 * 公共代理节点
 */
export const PUBLIC_PROXY_LIST: string[] = [
  ...getDomainProxyList('worker-proxy.asia'),
  ...getDomainProxyList('net-proxy.asia'),
  ...getDomainProxyList('workers-proxy.top'),
  ...getDomainProxyList('workers-proxy.shop'),
  ...getDomainProxyList('workers-proxy-1.shop'),
  ...getDomainProxyList('workers-proxy-2.shop'),
];

// 生成从00.到15.的16个二级域名
function getDomainProxyList(domain: string): string[] {
  const list: string[] = [];
  for (let i = 0; i < 16; i++) {
    list.push(`https://${('0' + i).slice(-2)}.${domain}`);
  }
  return list;
}

export const BLOCKED_IPS = [
  '23.184.88.251',
  '2409:8a55:6e1:a550:4a5f:8ff:feb6:3716',
  '120.230.80.75',
  '2001:da8:20c:a133::3:335a',
];
