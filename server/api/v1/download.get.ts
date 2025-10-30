import { proxyMpRequest } from '~/server/utils';
import { getCookie } from '~/server/kv/cookie';

interface SearchBizQuery {
  url: string;
  format: string;
}

export default defineEventHandler(async event => {
  const authorization = getRequestHeader(event, 'authorization');
  if (!authorization) {
    return {
      base_resp: {
        ret: -1,
        err_msg: 'token不合法',
      },
    };
  }
  const cookie = await getCookie(authorization);
  if (!cookie) {
    return {
      base_resp: {
        ret: -1,
        err_msg: 'token已失效',
      },
    };
  }

  const query = getQuery<SearchBizQuery>(event);
  if (!query.url) {
    return {
      base_resp: {
        ret: -1,
        err_msg: 'url不能为空',
      },
    };
  }

  const url = decodeURIComponent(query.url);
  const format: string = query.format || 'html';

  const text = await fetch(`https://08.workers-proxy.shop/?url=${url}`, {
    headers: {
      Referer: 'http://localhost:3000',
      Origin: 'http://localhost:3000',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    },
  }).then(res => res.text());
  return {
    html: text,
  };
});
