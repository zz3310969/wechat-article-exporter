export interface CookieItem {
  name: string;
  value: string;
  path: string;
  expires: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
}

// 解析 Response 中的 Set-Cookie
export function parseCookiesManual(cookies: string[]): Record<string, CookieItem> {
  const result: Record<string, CookieItem> = {};
  cookies.forEach(cookie => {
    const parts = cookie.split(';').map(v => v.trim());
    const [name, value] = parts[0].split('=');
    const other = parts.slice(1);

    const pathPart = other.find(part => part.startsWith('Path='));
    const expirePart = other.find(part => part.startsWith('Expires='));
    const sameSitePart = other.find(part => part.startsWith('SameSite='));
    result[name] = {
      name: name,
      value: value,
      path: pathPart?.split('=')[1] || '/',
      expires: expirePart?.split('=')[1] || '',
      secure: other.includes('secure'),
      httpOnly: other.includes('httponly'),
      sameSite: sameSitePart?.split('=')[1] || 'Lax',
    };
  });
  return result;
}

export function stringifyCookiesManual(cookies: Record<string, CookieItem>): string {
  let cookieStrings: string[] = [];

  Object.keys(cookies).forEach(name => {
    const item = cookies[name];

    let s = `${item.name}=${item.value}; Path=${item.path}; Expires=${item.expires}; SameSite=${item.sameSite}`;
    if (item.httpOnly) {
      s += '; HttpOnly';
    }
    if (item.secure) {
      s += '; Secure';
    }
    cookieStrings.push(s);
  });

  return cookieStrings.join(', ');
}

export function modCookies(cookies: string[]): string[] {
  return cookies.map(cookie => {
    if (!cookie.includes('SameSite=')) {
      return cookie + '; SameSite=None';
    }
    return cookie;
  });
}

export function modCookiePath(cookies: string[]): string[] {
  return cookies.map(cookie => {
    if (cookie.includes('Path=/;')) {
      return cookie.replace('Path=/;', 'Path=/api/v1/login;');
    }
    return cookie;
  });
}
