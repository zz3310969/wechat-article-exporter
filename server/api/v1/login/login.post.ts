import { proxyMpRequest } from '~/server/utils';
import { getCookie, setCookie, type CookieEntry } from '~/server/kv/cookie';
import { parseCookiesManual } from '~/server/utils/cookie';

export default defineEventHandler(async event => {
  const body: Record<string, string | number> = {
    userlang: 'zh_CN',
    redirect_url: '',
    cookie_forbidden: 0,
    cookie_cleaned: 0,
    plugin_used: 0,
    login_type: 3,
    token: '',
    lang: 'zh_CN',
    f: 'json',
    ajax: 1,
  };

  const response: Response = await proxyMpRequest({
    event: event,
    method: 'POST',
    endpoint: 'https://mp.weixin.qq.com/cgi-bin/bizlogin',
    query: {
      action: 'login',
    },
    body: body,
  });

  const cookies = response.headers.getSetCookie();
  const parsedCookies = parseCookiesManual(cookies);

  const _body = await response.json();
  const _token = new URL(`http://localhost${_body.redirect_url}`).searchParams.get('token')!;
  const _cookie: string[] = [];
  Object.keys(parsedCookies).forEach(key => {
    _cookie.push(key + '=' + parsedCookies[key].value);
  });
  const { nick_name } = await $fetch(`/api/login/info?token=${_token}`, {
    headers: {
      Cookie: _cookie.join(';'),
    },
  });
  if (!nick_name) {
    // 登录的非公众号
    return {
      err: '请选择公众号进行登录',
    };
  }

  const slave_user_cookie = parsedCookies['slave_user'];
  if (!slave_user_cookie) {
    return {
      err: '登录失败，请稍后重试',
    };
  }

  const uuid = crypto.randomUUID();
  const cookieEntry: CookieEntry = {
    key: uuid,
    token: _token,
    cookie: _cookie.join(';'),
  };
  await setCookie(cookieEntry);

  return {
    token: uuid,
    授权账号: nick_name,
    使用说明: '将 token 的值放在请求头 Authorization 中(不需要添加 Bearer，因为并不是标准的OAuth2.0规范)',
  };
});
