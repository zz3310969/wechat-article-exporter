<template>
  <header class="flex-none px-5 py-2 border-b dark:border-slate-500 flex items-center justify-between antialiased">
    <!-- 左侧: 当前选择公众号 -->
    <div class="flex-auto flex flex-col sm:flex-row sm:items-center min-w-0">
      <div class="text-md mr-2">当前选择公众号:</div>
      <div class="flex items-center">
        <span class="text-sky-400 font-semibold">{{ activeAccount?.nickname }}</span>
        <button
          @click="openSwitcher"
          title="切换"
          class="flex rounded text-sm leading-6 py-1 px-3 hover:bg-zinc-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-200"
        >
          <span class="sr-only">切换</span>
          <ArrowRightLeft :size="20" />
        </button>
      </div>
    </div>

    <ul class="flex space-x-5">
      <li class="hidden md:block">
        <SearchArticle v-model="articleQuery" @search="searchArticle" />
      </li>
      <li
        class="text-slate-500 hover:text-slate-600 cursor-pointer"
        @click="gotoLink('https://github.com/jooooock/wechat-article-exporter')"
      >
        <UIcon name="i-grommet-icons:github" class="size-8" />
      </li>
      <li class="text-slate-500 hover:text-slate-600 cursor-pointer">
        <UDropdown
          v-if="loginAccount"
          :items="items"
          :ui="{ item: { disabled: 'cursor-text select-text' } }"
          :popper="{ placement: 'bottom-start' }"
        >
          <UAvatar :src="loginAccount.avatar" />

          <template #account="{ item }">
            <div class="text-left">
              <p>登录用户</p>
              <p class="truncate font-medium text-gray-900 dark:text-white">
                {{ loginAccount.nickname }}
                <span v-if="isInsider" class="text-sm text-sky-500">(内测用户)</span>
              </p>
            </div>
          </template>

          <template #item="{ item }">
            <span class="truncate">{{ item.label }}</span>

            <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
          </template>
        </UDropdown>
      </li>
    </ul>
  </header>

  <USlideover v-model="isOpen" side="left" :ui="{ overlay: { background: 'bg-zinc-400/75' } }">
    <div
      class="rounded-lg divide-y divide-gray-100 dark:divide-gray-800 shadow bg-white dark:bg-gray-900 flex flex-col flex-1 overflow-y-scroll"
    >
      <div class="sticky top-0 bg-white py-4 px-2 shadow">
        <SearchAccountForm v-model="accountQuery" @search="searchAccount" />
      </div>
      <div class="flex-1">
        <ul class="divide-y antialiased">
          <li
            v-for="account in accountList"
            :key="account.fakeid"
            class="flex items-center px-2 py-4 hover:bg-slate-50 hover:cursor-pointer"
            :class="{ active: account.fakeid === activeAccount?.fakeid }"
            @click="selectAccount(account)"
          >
            <img v-if="account.type !== 'author'" class="size-20 mr-2" :src="account.round_head_img" alt="" />
            <div class="flex-1">
              <div class="flex justify-between">
                <p class="font-semibold">{{ account.nickname }}</p>
                <p v-if="account.type !== 'author'" class="text-sky-500 font-medium">
                  {{ ACCOUNT_TYPE[account.service_type] }}
                </p>
              </div>
              <p v-if="account.type !== 'author'" class="text-gray-500 text-sm">
                微信号: {{ account.alias || '未设置' }}
              </p>
              <p v-if="account.type !== 'author'" class="text-sm mt-2">{{ account.signature }}</p>
            </div>
          </li>
        </ul>

        <p v-if="loading" class="flex justify-center items-center my-2 py-2">
          <Loader :size="28" class="animate-spin text-slate-500" />
        </p>
        <p v-else-if="noMoreData" class="text-center mt-2 py-2 text-slate-400">已全部加载完毕</p>
        <button
          v-else-if="accountList.length > 0"
          @click="loadData"
          class="block mx-auto my-2 h-10 px-6 font-semibold rounded-md border border-slate-200 text-slate-900 dark:text-slate-300 hover:border-slate-400"
          type="button"
        >
          下一页
        </button>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import type { AccountInfo, AuthorInfo } from '~/types/types';
import { Loader, ArrowRightLeft } from 'lucide-vue-next';
import { ACCOUNT_LIST_PAGE_SIZE, ACCOUNT_TYPE, docsWebSite } from '~/config';
import { getAccountList } from '~/apis';
import type { DropdownItem } from '#ui/types';
import { gotoLink } from '~/utils';
import { isInsider } from '~/config/insider';

const loginAccount = useLoginAccount();
const activeAccount = useActiveAccount();

const emit = defineEmits(['select:account', 'search:article', 'toggle:deleted']);

const isOpen = ref(false);

const items: DropdownItem[][] = [
  [
    {
      label: '',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: '数据导出',
      icon: 'i-heroicons-solid:database',
      click: () => {
        navigateTo('/dashboard/article');
      },
    },
    {
      label: '设置',
      icon: 'i-heroicons-cog-8-tooth',
      click: () => {
        navigateTo('/dashboard/settings');
      },
    },
  ],
  [
    {
      label: '文档',
      icon: 'i-heroicons-book-open',
      click: () => {
        window.open(docsWebSite);
      },
    },
  ],
  [
    {
      label: '退出登录',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: () => {
        loginAccount.value = null;
        navigateTo('/login', { replace: true });
      },
    },
  ],
];

function openSwitcher() {
  isOpen.value = true;
  if (activeAccount.value?.type === 'author') {
    accountQuery.value = activeAccount.value?.fakeid!;
  } else {
    accountQuery.value = activeAccount.value?.nickname!;
  }
}

const accountQuery = ref('');
const accountList = reactive<(AccountInfo | AuthorInfo)[]>([]);
let begin = 0;

/**
 * 搜索公众号
 */
async function searchAccount() {
  begin = 0;
  accountList.length = 0;
  noMoreData.value = false;

  await loadData();
}

const loading = ref(false);
const noMoreData = ref(false);

/**
 * 加载公众号数据
 */
async function loadData() {
  loading.value = true;

  try {
    const [accounts, completed] = await getAccountList(loginAccount.value.token, begin, accountQuery.value);
    accountList.push(...accounts);
    begin += ACCOUNT_LIST_PAGE_SIZE;
    noMoreData.value = completed;
  } catch (e: any) {
    if (e.message === 'session expired') {
      navigateTo('/login');
    } else {
      console.error(e);
      alert(e.message);
    }
  } finally {
    loading.value = false;
  }
}

/**
 * 选择公众号
 * @param account
 */
function selectAccount(account: AccountInfo | AuthorInfo) {
  isOpen.value = false;
  activeAccount.value = account;

  nextTick(() => {
    emit('select:account', account);
  });
}

const articleQuery = ref('');

/**
 * 搜索文章
 */
function searchArticle() {
  if (!activeAccount.value) {
    alert('请先选择公众号');
    return;
  }

  emit('search:article', articleQuery.value);
}
</script>
