import fs from 'node:fs';
import path from 'node:path';
import { validateHTMLContent } from '#shared/utils/html';

const samplesDirectory = path.join(__dirname, '../samples');

const samples = [
  {
    group: '作者已删除',
    samples: [
      path.join(samplesDirectory, '作者已删除/01.html'),
      path.join(samplesDirectory, '作者已删除/02.html'),
      path.join(samplesDirectory, '作者已删除/03.html'),
      path.join(samplesDirectory, '作者已删除/04.html'),
      path.join(samplesDirectory, '作者已删除/05.html'),
      path.join(samplesDirectory, '作者已删除/06.html'),
    ],
  },
  {
    group: '内容违规',
    samples: [path.join(samplesDirectory, '内容违规/01.html'), path.join(samplesDirectory, '内容违规/02.html')],
  },
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
  {
    group: '该内容暂时无法查看',
    samples: [path.join(samplesDirectory, '该内容暂时无法查看/01.html')],
  },
];

function run() {
  for (const example of samples) {
    console.group(example.group);
    for (const samplePath of example.samples) {
      const rawHTMLContent = fs.readFileSync(samplePath, 'utf8');
      const result = validateHTMLContent(rawHTMLContent);
      console.log(result);
    }
    console.groupEnd();
    console.log();
  }
}

run();
