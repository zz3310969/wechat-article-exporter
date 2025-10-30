import { proxyMpRequest } from '~/server/utils';
import { getCookie } from '~/server/kv/cookie';

interface SearchBizQuery {
  begin?: number;
  size?: number;
  keyword: string;
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
  if (!query.keyword) {
    return {
      base_resp: {
        ret: -1,
        err_msg: 'keyword不能为空',
      },
    };
  }

  const keyword = query.keyword;
  const begin: number = query.begin || 0;
  const size: number = query.size || 5;

  const params: Record<string, string | number> = {
    action: 'search_biz',
    begin: begin,
    count: size,
    query: keyword,
    token: cookie.token,
    lang: 'zh_CN',
    f: 'json',
    ajax: '1',
  };

  return proxyMpRequest({
    event: event,
    method: 'GET',
    endpoint: 'https://mp.weixin.qq.com/cgi-bin/searchbiz',
    query: params,
    parseJson: true,
    cookie: cookie.cookie,
  }).catch(e => {
    return {
      base_resp: {
        ret: -1,
        err_msg: '搜索公众号接口失败，请稍后重试',
      },
    };
  });
});
