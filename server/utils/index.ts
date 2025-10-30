import { H3Event, parseCookies } from 'h3';
import { modCookies } from '~/server/utils/cookie';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  event: H3Event;
  endpoint: string;
  method: Method;
  query?: Record<string, string | number | undefined>;
  body?: Record<string, string | number | undefined>;
  parseJson?: boolean;
  withCredentials?: boolean;
  cookie?: string;
}

export async function proxyMpRequest(options: RequestOptions) {
  let cookie = options.cookie;
  if (!cookie) {
    const cookies = parseCookies(options.event);
    cookie = Object.keys(cookies)
      .map(key => `${key}=${cookies[key]}`)
      .join(';');
  }

  if (options.withCredentials === undefined) {
    options.withCredentials = true;
  }

  const fetchInit: RequestInit = {
    method: options.method,
    headers: {
      Referer: 'https://mp.weixin.qq.com/',
      Origin: 'https://mp.weixin.qq.com',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      Cookie: options.withCredentials ? cookie : '',
    },
  };

  if (options.query) {
    options.endpoint += '?' + new URLSearchParams(options.query as Record<string, string>).toString();
  }
  if (options.method === 'POST' && options.body) {
    fetchInit.body = new URLSearchParams(options.body as Record<string, string>).toString();
  }

  const response = await fetch(options.endpoint, fetchInit);

  // 修改微信接口返回的 Cookie 中的 SameSite 属性，默认不返回(默认值Lax)，为了支持 iframe 跨域访问，修改为 None
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  const modifiedCookies = modCookies(response.headers.getSetCookie());
  if (modifiedCookies.length > 0) {
    modifiedResponse.headers.delete('set-cookie');
    modifiedCookies.forEach(cookie => {
      modifiedResponse.headers.append('set-cookie', cookie);
    });
  }

  if (!options.parseJson) {
    return modifiedResponse;
  } else {
    return modifiedResponse.json();
  }
}
