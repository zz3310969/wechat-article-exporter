import path from 'node:path';
import fs from 'node:fs';
import { normalizeHtml } from '#shared/utils/html';

const samplesDirectory = path.join(__dirname, '../samples');

const samples = [
  {
    group: '图片分享',
    samples: [
      path.join(samplesDirectory, '图片分享/01.html'),
      path.join(samplesDirectory, '图片分享/02.html'),
      path.join(samplesDirectory, '图片分享/03.html'),
      path.join(samplesDirectory, '图片分享/04.html'),
      path.join(samplesDirectory, '图片分享/05.html'),
    ],
  },
  {
    group: '文本分享',
    samples: [
      path.join(samplesDirectory, '文本分享/01.html'),
      path.join(samplesDirectory, '文本分享/02.html'),
      path.join(samplesDirectory, '文本分享/03.html'),
      path.join(samplesDirectory, '文本分享/04.html'),
      path.join(samplesDirectory, '文本分享/c01.html'),
      path.join(samplesDirectory, '文本分享/c02.html'),
      path.join(samplesDirectory, '文本分享/c03.html'),
      path.join(samplesDirectory, '文本分享/c04.html'),
      path.join(samplesDirectory, '文本分享/c05.html'),
    ],
  },
  {
    group: '文章分享',
    samples: [
      path.join(samplesDirectory, '文章分享/01.html'),
      path.join(samplesDirectory, '文章分享/02.html'),
      path.join(samplesDirectory, '文章分享/03.html'),
      path.join(samplesDirectory, '文章分享/04.html'),
    ],
  },
  {
    group: '普通图文',
    samples: [
      path.join(samplesDirectory, '普通图文/01.html'),
      path.join(samplesDirectory, '普通图文/02.html'),
      path.join(samplesDirectory, '普通图文/03.html'),
      path.join(samplesDirectory, '普通图文/04.html'),
      path.join(samplesDirectory, '普通图文/c01.html'),
    ],
  },
];

function normalizeOutPath(input: string): string {
  const segments = input.split('/');
  segments[segments.length - 1] = 'normalize-' + segments[segments.length - 1];
  return segments.join('/');
}

function run() {
  for (const example of samples) {
    console.group(example.group);
    for (const samplePath of example.samples) {
      const rawHTMLContent = fs.readFileSync(samplePath, 'utf8');
      const result = normalizeHtml(rawHTMLContent);
      fs.writeFileSync(normalizeOutPath(samplePath), result, 'utf8');
      console.log(samplePath, '已处理');
    }
    console.groupEnd();
    console.log();
  }
}

run();
