import { Window } from 'happy-dom';

// 解析 html 中的 window.cgiDataNew 对象
export function parseCgiDataNewServer(html: string): any {
  const window = new Window();

  // 关键：显式启用 JavaScript 执行
  // @ts-ignore – happyDOM 是内部属性，但社区广泛使用
  window.happyDOM.settings.enableJavaScriptEvaluation = true;

  window.document.write(html);
  window.document.close();

  const data = (window as any).cgiDataNew;
  window.close();

  return data;
}
