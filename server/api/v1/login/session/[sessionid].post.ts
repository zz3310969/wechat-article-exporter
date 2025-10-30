import { proxyMpRequest } from '~/server/utils';
import { modCookiePath } from '~/server/utils/cookie';

export default defineEventHandler(async event => {
  const { sessionid } = event.context.params!;

  const body: Record<string, string | number> = {
    userlang: 'zh_CN',
    redirect_url: '',
    login_type: 3,
    sessionid: sessionid,
    token: '',
    lang: 'zh_CN',
    f: 'json',
    ajax: 1,
  };

  // 需要将cookie路径替换为 /api/v1/login,防止与网页版cookie冲突
  const response = await proxyMpRequest({
    event: event,
    method: 'POST',
    endpoint: 'https://mp.weixin.qq.com/cgi-bin/bizlogin',
    query: {
      action: 'startlogin',
    },
    body: body,
  });

  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  const modifiedCookies = modCookiePath(response.headers.getSetCookie());
  if (modifiedCookies.length > 0) {
    modifiedResponse.headers.delete('set-cookie');
    modifiedCookies.forEach(cookie => {
      modifiedResponse.headers.append('set-cookie', cookie);
    });
  }

  return modifiedResponse;
});
