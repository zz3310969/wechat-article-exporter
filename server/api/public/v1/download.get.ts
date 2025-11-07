import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { getTokenFromStore } from '~/server/utils/CookieStore';
import { USER_AGENT } from '~/config';

interface SearchBizQuery {
  url: string;
  format: string;
}

export default defineEventHandler(async event => {
  const token = await getTokenFromStore(event);

  if (!token) {
    return {
      base_resp: {
        ret: -1,
        err_msg: '认证信息无效',
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
  if (!['html', 'markdown', 'text'].includes(format)) {
    return {
      base_resp: {
        ret: -1,
        err_msg: '不支持的format',
      },
    };
  }

  // https://mp.weixin.qq.com/s/tr38EieqyftubIx2FMWUWw
  const rawHtml = await fetch(url, {
    headers: {
      Referer: 'https://mp.weixin.qq.com/',
      Origin: 'https://mp.weixin.qq.com',
      'User-Agent': USER_AGENT,
    },
  }).then(res => res.text());

  const html = normalizeHtml(rawHtml);

  if (format === 'html') {
    return html;
  } else if (format === 'text') {
    // return ($jsArticleContent as HTMLElement).innerText!.replace(/\s+/g, ' ').trim();
    return '(text)';
  } else if (format === 'markdown') {
    const turndownService = new TurndownService();
    return turndownService.turndown(html);
  }
});

function normalizeHtml(rawHTML: string): string {
  const document = new JSDOM(rawHTML).window.document;

  const $jsArticleContent = document.querySelector('#js_article')!;

  // #js_content 默认是不可见的(通过js修改为可见)，需要移除该样式
  $jsArticleContent.querySelector('#js_content')?.removeAttribute('style');

  // 删除无用dom元素
  $jsArticleContent.querySelector('#js_top_ad_area')?.remove();
  $jsArticleContent.querySelector('#js_tags_preview_toast')?.remove();
  $jsArticleContent.querySelector('#content_bottom_area')?.remove();
  $jsArticleContent.querySelectorAll('script').forEach(el => {
    el.remove();
  });
  $jsArticleContent.querySelector('#js_pc_qr_code')?.remove();
  $jsArticleContent.querySelector('#wx_stream_article_slide_tip')?.remove();

  // 处理图片懒加载
  const imgs = document.querySelectorAll<HTMLImageElement>('img');
  for (const img of imgs) {
    const imgUrl = img.getAttribute('src') || img.getAttribute('data-src');
    if (imgUrl) {
      img.src = imgUrl;
    }
  }

  let bodyCls = document.body.className;
  const pageContentHTML = $jsArticleContent.outerHTML;

  return `<!DOCTYPE html>
  <html lang="zh_CN">
  <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0,viewport-fit=cover">
      <meta name="referrer" content="no-referrer">
      <style>
          #js_row_immersive_stream_wrap {
              max-width: 667px;
              margin: 0 auto;
          }
          #js_row_immersive_stream_wrap .wx_follow_avatar_pic {
            display: block;
            margin: 0 auto;
          }
          #page-content,
          #js_article_bottom_bar,
          .__page_content__ {
              max-width: 667px;
              margin: 0 auto;
          }
          img {
              max-width: 100%;
          }
          .sns_opr_btn::before {
              width: 16px;
              height: 16px;
              margin-right: 3px;
          }
      </style>
  </head>
  <body class="${bodyCls}">
  ${pageContentHTML}
  </body>
  </html>
    `;
}
