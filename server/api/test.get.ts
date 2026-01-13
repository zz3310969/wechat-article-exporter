import { parseCgiDataNewServer } from '~/server/utils/html';

interface DebugQuery {
  key: string;
  url: string;
}

export default defineEventHandler(async event => {
  const { key, url } = getQuery<DebugQuery>(event);
  if (key && key === process.env.DEBUG_KEY) {
    const html = await fetch(`https://10.workers-proxy-2.shop?url=${url}`, {
      method: 'GET',
      headers: {
        referer: 'https://down.mptext.top',
      },
    }).then(resp => resp.text());
    return parseCgiDataNewServer(html);
  } else {
    return 'not set debug key';
  }
});
