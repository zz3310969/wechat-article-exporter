<template>
  <div class="h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 dark:text-slate-50 font-bold">
        文章 <span class="text-sm text-slate-10">本地已缓存文章</span>
      </h1>
    </Teleport>

    <div class="flex flex-col h-full divide-y divide-gray-200">
      <!-- 顶部筛选与操作区 -->
      <header class="flex flex-col items-start 2xl:flex-row 2xl:items-center gap-2 2xl:justify-between px-3 py-2">
        <div class="flex flex-col xl:flex-row gap-2">
          <div class="flex space-x-3">
            <AccountSelectorForArticle v-model="selectedAccount" class="w-60" />
            <UInput v-model="query.title" placeholder="请输入标题过滤" color="gray" size="md" />
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton icon="i-heroicons-calendar-days-20-solid" color="gray" size="md">
                {{ format(query.dateRange.start, 'yyyy-MM-dd') }} - {{ format(query.dateRange.end, 'yyyy-MM-dd') }}
              </UButton>

              <template #panel="{ close }">
                <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
                  <div class="hidden sm:flex flex-col py-4">
                    <UButton
                      v-for="(range, index) in ranges"
                      :key="index"
                      :label="range.label"
                      color="gray"
                      variant="ghost"
                      class="rounded-none px-6"
                      :class="[
                        isRangeSelected(range.duration)
                          ? 'bg-gray-100 dark:bg-gray-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                      ]"
                      truncate
                      @click="selectRange(range.duration)"
                    />
                  </div>

                  <DatePicker v-model="query.dateRange" @close="close" />
                </div>
              </template>
            </UPopover>
          </div>
          <div class="flex space-x-3">
            <USelectMenu
              class="w-40"
              color="gray"
              v-model="query.authors"
              :options="articleAuthors"
              multiple
              size="md"
              placeholder="选择作者"
            />

            <USelect v-model="query.isOriginal" :options="originalOptions" color="gray" size="md" />

            <UButton color="gray" variant="solid" @click="search" size="md">搜索</UButton>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <ButtonGroup
            :items="[
              { label: '文章内容', event: 'download-article-html' },
              { label: '阅读量 (需要Credential)', event: 'download-article-metadata' },
              { label: '留言内容 (需要Credential)', event: 'download-article-comment' },
            ]"
            @download-article-html="downloadArticleHTML"
            @download-article-metadata="downloadArticleMetadata"
            @download-article-comment="downloadArticleComment"
          >
            <UButton
              :loading="downloadBtnLoading"
              :disabled="selectedArticles.length === 0"
              color="white"
              class="font-mono"
              :label="downloadBtnLoading ? `抓取中 ${progress_1}/${progress_2}` : '抓取'"
              trailing-icon="i-heroicons-chevron-down-20-solid"
            />
          </ButtonGroup>
          <ButtonGroup
            :items="[
              { label: 'Excel', event: 'export-article-excel' },
              { label: 'JSON', event: 'export-article-json' },
              { label: 'HTML', event: 'export-article-html' },
              { label: 'Txt', event: 'export-article-txt' },
              { label: 'Word (开发中)', event: 'export-article-word', disabled: true },
              { label: 'Markdown (开发中)', event: 'export-article-markdown', disabled: true },
            ]"
            @export-article-excel="export2excel"
            @export-article-json="export2json"
            @export-article-html="export2html"
            @export-article-txt="export2txt"
            @export-article-word="export2word"
            @export-article-markdown="export2markdown"
          >
            <UButton
              :loading="exportBtnLoading"
              :disabled="selectedArticles.length === 0"
              color="white"
              class="font-mono"
              :label="exportBtnLoading ? `${exportPhase} ${progress_1}/${progress_2}` : '导出'"
              trailing-icon="i-heroicons-chevron-down-20-solid"
            />
          </ButtonGroup>
          <UButton v-if="isDev" @click="debug">调试</UButton>
        </div>
      </header>

      <!-- 文章列表 -->
      <main class="flex-1 overflow-y-scroll">
        <div v-if="loading" class="flex justify-center items-center mt-5">
          <Loader :size="28" class="animate-spin text-slate-500" />
        </div>
        <div class="relative" v-else-if="selectedAccount">
          <table class="w-full border-collapse">
            <thead class="sticky top-[0px] z-10 h-[40px] bg-white">
              <tr>
                <th>
                  <UCheckbox
                    class="justify-center"
                    :indeterminate="isIndeterminate"
                    v-model="checkAll"
                    @change="onCheckAllChange"
                    color="blue"
                  />
                </th>
                <th class="w-14">序号</th>
                <th>标题</th>
                <th class="w-20">文章内容</th>
                <th class="w-14">阅读量</th>
                <th class="w-14">点赞量</th>
                <th class="w-14">分享量</th>
                <th class="w-14">喜欢量</th>
                <th class="w-20">留言条数</th>
                <th class="w-20">留言内容</th>
                <th class="w-52">发布时间</th>
                <th>作者</th>
                <th class="w-24">是否原创</th>
                <th class="w-36">所属合集</th>
                <th class="w-12">原文</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(article, index) in displayedArticles" :key="article.aid">
                <td class="text-center" @click="toggleArticleCheck(article)">
                  <UCheckbox class="justify-center" v-model="article.checked" color="blue" />
                </td>
                <td class="text-center font-mono">{{ index + 1 }}</td>
                <td class="px-4 font-mono">{{ maxLen(article.title) }}</td>
                <td class="text-center">
                  <UTooltip v-if="article.contentDownload" text="文章内容已下载" :popper="{ placement: 'top' }">
                    <UIcon name="i-line-md:emoji-smile" class="w-6 h-6 bg-green-500" @click="preview(article)" />
                  </UTooltip>
                  <UTooltip v-else-if="article.is_deleted" text="文章已删除" :popper="{ placement: 'top' }">
                    <UIcon name="i-line-md:emoji-cry" class="w-6 h-6 bg-fuchsia-500" />
                  </UTooltip>
                  <UTooltip v-else text="文章内容未下载" :popper="{ placement: 'top' }">
                    <UIcon name="i-line-md:emoji-frown" class="w-6 h-6 bg-rose-500" />
                  </UTooltip>
                </td>
                <td class="text-center">{{ formatNum(article.readNum) }}</td>
                <td class="text-center">{{ formatNum(article.oldLikeNum) }}</td>
                <td class="text-center">{{ formatNum(article.shareNum) }}</td>
                <td class="text-center">{{ formatNum(article.likeNum) }}</td>
                <td class="text-center">{{ formatNum(article.commentNum) }}</td>
                <td class="text-center">
                  <UTooltip v-if="article.commentDownload" text="留言内容已下载" :popper="{ placement: 'top' }">
                    <UIcon name="i-line-md:emoji-smile" class="w-6 h-6 bg-green-500" />
                  </UTooltip>
                  <UTooltip v-else text="留言内容未下载" :popper="{ placement: 'top' }">
                    <UIcon name="i-line-md:emoji-frown" class="w-6 h-6 bg-rose-500" />
                  </UTooltip>
                </td>
                <td class="text-center font-mono">{{ formatTimeStamp(article.update_time) }}</td>
                <td class="text-center">{{ article.author_name }}</td>
                <td class="text-center">
                  {{ article.copyright_stat === 1 && article.copyright_type === 1 ? '原创' : '' }}
                </td>
                <td>
                  <p class="flex flex-wrap">
                    <span v-for="album in article.appmsg_album_infos" :key="album.id" class="text-blue-600 mr-2"
                      >#{{ album.title }}</span
                    >
                  </p>
                </td>
                <td class="text-center">
                  <a class="text-blue-500 underline" :href="article.link" target="_blank">
                    <UIcon name="i-heroicons-link-16-solid" class="w-5 h-5" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- 状态栏 -->
          <div class="sticky bottom-0 h-[40px] bg-white flex items-center px-4 gap-3 border-t-2 font-mono">
            <span class="text-green-500">已选 {{ selectedArticles.length }}/{{ displayedArticles.length }}</span>
            <span class="text-rose-400 text-sm" v-if="deletedArticlesCount > 0"
              >(已隐藏{{ deletedArticlesCount }}条已被删除的文章)</span
            >
          </div>
        </div>
      </main>
    </div>

    <PreviewArticle ref="previewArticleRef" />
  </div>
</template>

<script setup lang="ts">
import { type Info } from '~/store/v2/info';
import { getArticleCache, articleDeleted } from '~/store/v2/article';
import type { AppMsgEx } from '~/types/types';
import { formatElapsedTime, formatTimeStamp, formatNum, maxLen, sleep } from '~/utils';
import { Loader } from 'lucide-vue-next';
import { type Duration, format, isSameDay, sub } from 'date-fns';
import { Downloader } from '~/utils/download/Downloader';
import { Exporter } from '~/utils/download/Exporter';
import { getHtmlCache } from '~/store/v2/html';
import { getCommentCache } from '~/store/v2/comment';
import type { ArticleMetadata, DownloaderStatus, ExporterStatus } from '~/utils/download/types';
import { getMetadataCache, type Metadata } from '~/store/v2/metadata';
import { export2ExcelFile, export2JsonFile } from '~/utils/exporter';
import type { PreviewArticle } from '#components';
import { renderComments } from '~/utils/comment';
import type { Preferences } from '~/types/preferences';

const isDev = !import.meta.env.PROD;

const preferences = usePreferences();
const hideDeleted = computed(() => (preferences.value as unknown as Preferences).hideDeleted);

const previewArticleRef = ref<typeof PreviewArticle | null>(null);

function preview(article: Article) {
  previewArticleRef.value!.open(article);
}

// 当前页面的数据模型
interface Article extends AppMsgEx, Partial<ArticleMetadata> {
  /**
   * 是否被选中
   */
  checked: boolean;

  /**
   * 是否显示
   */
  display: boolean;

  /**
   * 文章内容是否已下载
   */
  contentDownload: boolean;

  /**
   * 留言内容是否已下载
   */
  commentDownload: boolean;
}

useHead({
  title: '文章链接 | 微信公众号文章导出',
});

const selectedAccount = ref<Info | undefined>();
const selectedAccountName = computed(() => selectedAccount.value?.nickname || selectedAccount.value?.fakeid || '');

watch(selectedAccount, newVal => {
  switchTableData(newVal!.fakeid).catch(() => {});
});

const articles = reactive<Article[]>([]);
const loading = ref(false);

const checkAll = ref(false);
const isIndeterminate = ref(false);

const displayedArticles = computed(() => {
  return articles.filter(article => article.display);
});
const selectedArticles = computed(() => {
  return articles.filter(article => article.checked && article.display);
});
const deletedArticlesCount = ref(0);

async function switchTableData(fakeid: string) {
  checkAll.value = false;
  isIndeterminate.value = false;

  loading.value = true;
  articles.length = 0;
  const data = await getArticleCache(fakeid, Date.now());
  deletedArticlesCount.value = data.filter(article => article.is_deleted).length;
  for (const article of data.filter(article => (hideDeleted.value ? !article.is_deleted : true))) {
    const contentDownload = (await getHtmlCache(article.link)) !== undefined;
    const commentDownload = (await getCommentCache(article.link)) !== undefined;
    const metadata = await getMetadataCache(article.link);
    if (metadata) {
      articles.push({
        ...metadata,
        ...article,
        checked: false,
        display: true,
        author_name: article.author_name || '--',
        contentDownload: contentDownload,
        commentDownload: commentDownload,
      });
    } else {
      articles.push({
        ...article,
        checked: false,
        display: true,
        author_name: article.author_name || '--',
        contentDownload: contentDownload,
        commentDownload: commentDownload,
      });
    }
  }
  await sleep(500);
  loading.value = false;

  query.title = '';
  query.authors = [];
  query.isOriginal = '所有';
  query.dateRange = {
    start: new Date(articles[articles.length - 1].update_time * 1000),
    end: new Date(),
  };
}

function toggleArticleCheck(article: Article) {
  article.checked = !article.checked;

  if (articles.every(article => article.checked)) {
    // 全部选中
    checkAll.value = true;
    isIndeterminate.value = false;
  } else if (articles.every(article => !article.checked)) {
    // 全部取消选中
    checkAll.value = false;
    isIndeterminate.value = false;
  } else {
    //
    isIndeterminate.value = true;
    checkAll.value = false;
  }
}

function onCheckAllChange() {
  if (checkAll.value) {
    articles.forEach(article => {
      article.checked = true;
      isIndeterminate.value = false;
    });
  } else {
    articles.forEach(article => {
      article.checked = false;
      isIndeterminate.value = false;
    });
  }
}

const articleAuthors = computed(() => {
  return [...new Set(articles.map(article => article.author_name).filter(author => !!author))];
});

function isRangeSelected(duration: Duration) {
  return isSameDay(query.dateRange.start, sub(new Date(), duration)) && isSameDay(query.dateRange.end, new Date());
}

function selectRange(duration: Duration) {
  query.dateRange = { start: sub(new Date(), duration), end: new Date() };
}

const ranges = [
  { label: '最近7天', duration: { days: 7 } },
  { label: '最近14天', duration: { days: 14 } },
  { label: '最近30天', duration: { days: 30 } },
  { label: '最近3个月', duration: { months: 3 } },
  { label: '最近6个月', duration: { months: 6 } },
  { label: '最近1年', duration: { years: 1 } },
  { label: '最近3年', duration: { years: 3 } },
  { label: '最近5年', duration: { years: 5 } },
  { label: '所有', duration: { years: 20 } },
];
const originalOptions = ['原创', '非原创', '所有'];

interface ArticleQuery {
  title: string;
  dateRange: { start: Date; end: Date };
  authors: string[];
  isOriginal: '原创' | '非原创' | '所有';
}

const query = reactive<ArticleQuery>({
  title: '',
  dateRange: { start: sub(new Date(), { days: 14 }), end: new Date() },
  authors: [],
  isOriginal: '所有',
});

function search() {
  checkAll.value = false;
  isIndeterminate.value = false;

  articles.forEach(article => {
    article.display = true;
    article.checked = false;

    if (query.title && !article.title.includes(query.title)) {
      article.display = false;
    }
    if (query.authors.length > 0 && !query.authors.includes(article.author_name)) {
      article.display = false;
    }
    if (query.isOriginal === '原创' && (article.copyright_stat !== 1 || article.copyright_type !== 1)) {
      article.display = false;
    }
    if (query.isOriginal === '非原创' && article.copyright_stat === 1 && article.copyright_type === 1) {
      article.display = false;
    }
    if (
      new Date(article.update_time * 1000) < query.dateRange.start ||
      new Date(article.update_time * 1000) > query.dateRange.end
    ) {
      article.display = false;
    }
  });
}

const toast = useToast();

const downloadBtnLoading = ref(false);
const progress_1 = ref(0);
const progress_2 = ref(0);

// 抓取文章HTML
async function downloadArticleHTML() {
  const urls: string[] = selectedArticles.value.map(article => article.link);

  const manager = new Downloader(selectedAccount.value!.fakeid, urls);
  manager.on('download:progress', (url: string, success: boolean, status: DownloaderStatus) => {
    console.log(
      `进度: (进行中:${status.pending.length} / 已完成:${status.completed.length} / 已失败:${status.failed.length} / 已删除:${status.deleted.length})`
    );
    progress_1.value = status.completed.length;
    if (success) {
      const article = articles.find(article => article.link === url);
      if (article) {
        article.contentDownload = true;
      } else {
        console.warn(`${url} not found in table data when update contentDownload`);
      }
    }
  });
  manager.on('download:deleted', (url: string) => {
    const article = articles.find(article => article.link === url);
    if (article) {
      article.is_deleted = true;
      article.checked = false;
      articleDeleted(url);
    }
  });
  manager.on('download:begin', () => {
    console.log('开始抓取【文章内容】...');
    progress_1.value = 0;
    progress_2.value = urls.length;
  });
  manager.on('download:finish', (seconds: number, status: DownloaderStatus) => {
    console.log('耗时:', formatElapsedTime(seconds));
    toast.add({
      id: 'update_downloaded',
      color: 'purple',
      title: '【文章内容】抓取完成',
      description: `本次抓取耗时 ${formatElapsedTime(seconds)}, 成功:${status.completed.length}, 失败:${status.failed.length}, 检测到已被删除:${status.deleted.length}`,
      icon: 'i-octicon-desktop-download-24',
    });
  });

  try {
    downloadBtnLoading.value = true;
    await manager.startDownload('html');
  } catch (error) {
    console.error('【文章内容】抓取失败:', error);
    alert((error as Error).message);
  } finally {
    downloadBtnLoading.value = false;
  }
}

// 抓取文章阅读量、点赞量等元数据
async function downloadArticleMetadata() {
  const urls: string[] = selectedArticles.value.map(article => article.link);

  const manager = new Downloader(selectedAccount.value!.fakeid, urls);
  manager.on('download:progress', (url: string, success: boolean, status: DownloaderStatus) => {
    console.log(
      `进度: (进行中:${status.pending.length} / 已完成:${status.completed.length} / 已失败:${status.failed.length} / 已删除:${status.deleted.length})`
    );
    progress_1.value = status.completed.length;
  });
  manager.on('download:metadata', (url: string, metadata: Metadata) => {
    const article = articles.find(article => article.link === url);
    if (article) {
      article.readNum = metadata.readNum;
      article.oldLikeNum = metadata.oldLikeNum;
      article.shareNum = metadata.shareNum;
      article.likeNum = metadata.likeNum;
      article.commentNum = metadata.commentNum;
    } else {
      console.warn(`${url} not found in table data when update metadata`);
    }
  });
  manager.on('download:deleted', (url: string) => {
    const article = articles.find(article => article.link === url);
    if (article) {
      article.is_deleted = true;
      article.checked = false;
      articleDeleted(url);
    }
  });
  manager.on('download:begin', () => {
    console.log('开始抓取【阅读量】...');
    progress_1.value = 0;
    progress_2.value = urls.length;
  });
  manager.on('download:finish', (seconds: number, status: DownloaderStatus) => {
    console.log('耗时:', formatElapsedTime(seconds));
    toast.add({
      id: 'update_downloaded',
      color: 'purple',
      title: '【阅读量】抓取完成',
      description: `本次抓取耗时 ${formatElapsedTime(seconds)}, 成功:${status.completed.length}, 失败:${status.failed.length}, 检测到已被删除:${status.deleted.length}`,
      icon: 'i-octicon-desktop-download-24',
    });
  });

  try {
    downloadBtnLoading.value = true;
    await manager.startDownload('metadata');
  } catch (error) {
    console.error('【阅读量】抓取失败:', error);
    alert((error as Error).message);
  } finally {
    downloadBtnLoading.value = false;
  }
}

// 抓取文章留言数据
async function downloadArticleComment() {
  const urls: string[] = selectedArticles.value.map(article => article.link);

  const manager = new Downloader(selectedAccount.value!.fakeid, urls);
  manager.on('download:progress', (url: string, success: boolean, status: DownloaderStatus) => {
    console.log(
      `进度: (进行中:${status.pending.length} / 已完成:${status.completed.length} / 已失败:${status.failed.length} / 已删除:${status.deleted.length})`
    );
    progress_1.value = status.completed.length;
    if (success) {
      const article = articles.find(article => article.link === url);
      if (article) {
        article.commentDownload = true;
      } else {
        console.warn(`${url} not found in table data when update commentDownload`);
      }
    }
  });
  manager.on('download:begin', () => {
    console.log('开始抓取【留言内容】...');
    progress_1.value = 0;
    progress_2.value = urls.length;
  });
  manager.on('download:finish', (seconds: number, status: DownloaderStatus) => {
    console.log('耗时:', formatElapsedTime(seconds));
    toast.add({
      id: 'update_downloaded',
      color: 'purple',
      title: '【留言内容】抓取完成',
      description: `本次抓取耗时 ${formatElapsedTime(seconds)}, 成功:${status.completed.length}, 失败:${status.failed.length}`,
      icon: 'i-octicon-desktop-download-24',
    });
  });

  try {
    downloadBtnLoading.value = true;
    await manager.startDownload('comments');
  } catch (error) {
    console.error('【留言内容】抓取失败:', error);
    alert((error as Error).message);
  } finally {
    downloadBtnLoading.value = false;
  }
}

const exportBtnLoading = ref(false);
const exportPhase = ref('导出中');

// 导出 excel
function export2excel() {
  const articles = selectedArticles.value.map(article => ({ ...article }));
  export2ExcelFile(articles, selectedAccountName.value);
}

// 导出 json
function export2json() {
  const articles = selectedArticles.value.map(article => ({ ...article }));
  export2JsonFile(articles, selectedAccountName.value);
}

// 导出 html
async function export2html() {
  const urls: string[] = selectedArticles.value.map(article => article.link);

  const manager = new Exporter(selectedAccount.value!.fakeid, urls);
  manager.on('export:begin', () => {
    exportPhase.value = '资源解析中';
    progress_1.value = 0;
    progress_2.value = 0;
  });
  manager.on('export:download', (total: number) => {
    exportPhase.value = '资源下载中';
    progress_1.value = 0;
    progress_2.value = total;
  });
  manager.on('export:download:progress', (url: string, success: boolean, status: ExporterStatus) => {
    progress_1.value = status.completed.length;
  });
  manager.on('export:write', (total: number) => {
    exportPhase.value = '文件写入中';
    progress_1.value = 0;
    progress_2.value = total;
  });
  manager.on('export:write:progress', (index: number) => {
    progress_1.value = index;
  });
  manager.on('export:finish', (seconds: number) => {
    console.log('耗时:', formatElapsedTime(seconds));
    toast.add({
      id: 'update_downloaded',
      color: 'purple',
      title: 'HTML 导出完成',
      description: `本次导出耗时 ${formatElapsedTime(seconds)}`,
      icon: 'i-octicon-desktop-download-24',
    });
  });

  try {
    exportBtnLoading.value = true;
    await manager.startExport('html');
  } catch (error) {
    console.error('导出任务失败:', error);
    alert((error as Error).message);
  } finally {
    exportBtnLoading.value = false;
  }
}

// 导出 txt
async function export2txt() {
  const urls: string[] = selectedArticles.value.map(article => article.link);

  const manager = new Exporter(selectedAccount.value!.fakeid, urls);
  manager.on('export:begin', () => {
    exportPhase.value = '资源解析中';
    progress_1.value = 0;
    progress_2.value = 0;
  });
  manager.on('export:write', (total: number) => {
    exportPhase.value = '文件写入中';
    progress_1.value = 0;
    progress_2.value = total;
  });
  manager.on('export:write:progress', (index: number) => {
    progress_1.value = index;
  });
  manager.on('export:finish', (seconds: number) => {
    console.log('耗时:', formatElapsedTime(seconds));
    toast.add({
      id: 'update_downloaded',
      color: 'purple',
      title: 'Txt 导出完成',
      description: `本次导出耗时 ${formatElapsedTime(seconds)}`,
      icon: 'i-octicon-desktop-download-24',
    });
  });

  try {
    exportBtnLoading.value = true;
    await manager.startExport('txt');
  } catch (error) {
    console.error('导出任务失败:', error);
    alert((error as Error).message);
  } finally {
    exportBtnLoading.value = false;
  }
}

// 导出 word
async function export2word() {
  const urls: string[] = selectedArticles.value.map(article => article.link);

  const manager = new Exporter(selectedAccount.value!.fakeid, urls);
  manager.on('export:begin', () => {
    exportPhase.value = '资源解析中';
    progress_1.value = 0;
    progress_2.value = 0;
  });
  manager.on('export:write', (total: number) => {
    exportPhase.value = '文件写入中';
    progress_1.value = 0;
    progress_2.value = total;
  });
  manager.on('export:write:progress', (index: number) => {
    progress_1.value = index;
  });
  manager.on('export:finish', (seconds: number) => {
    console.log('耗时:', formatElapsedTime(seconds));
    toast.add({
      id: 'update_downloaded',
      color: 'purple',
      title: 'Word 导出完成',
      description: `本次导出耗时 ${formatElapsedTime(seconds)}`,
      icon: 'i-octicon-desktop-download-24',
    });
  });

  try {
    exportBtnLoading.value = true;
    await manager.startExport('word');
  } catch (error) {
    console.error('导出任务失败:', error);
    alert((error as Error).message);
  } finally {
    exportBtnLoading.value = false;
  }
}

// 导出 markdown
async function export2markdown() {
  const urls: string[] = selectedArticles.value.map(article => article.link);

  const manager = new Exporter(selectedAccount.value!.fakeid, urls);
  manager.on('export:begin', () => {
    exportPhase.value = '资源解析中';
    progress_1.value = 0;
    progress_2.value = 0;
  });
  manager.on('export:write', (total: number) => {
    exportPhase.value = '文件写入中';
    progress_1.value = 0;
    progress_2.value = total;
  });
  manager.on('export:write:progress', (index: number) => {
    progress_1.value = index;
  });
  manager.on('export:finish', (seconds: number) => {
    console.log('耗时:', formatElapsedTime(seconds));
    toast.add({
      id: 'update_downloaded',
      color: 'purple',
      title: 'Markdown 导出完成',
      description: `本次导出耗时 ${formatElapsedTime(seconds)}`,
      icon: 'i-octicon-desktop-download-24',
    });
  });

  try {
    exportBtnLoading.value = true;
    await manager.startExport('markdown');
  } catch (error) {
    console.error('导出任务失败:', error);
    alert((error as Error).message);
  } finally {
    exportBtnLoading.value = false;
  }
}

async function debug() {
  const html = await renderComments('https://mp.weixin.qq.com/s/0GDv8tE03ZQFLQDpLo2Usw');
  console.log(html);
}
</script>

<style scoped>
table th {
  padding: 0.5rem 0.25rem;
}

table td {
  border: 1px solid #00002d17;
  padding: 0.25rem 0.5rem;
}

td:first-child,
th:first-child {
  border-left: none;
}

td:last-child,
th:last-child {
  border-right: none;
}

th {
  border: 1px solid #00002d17;
  border-top: none;
}

tr:nth-child(even) {
  background-color: #00005506;
}

tr:hover {
  background-color: #00005506;
}
</style>
