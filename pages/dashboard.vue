<template>
  <div class="flex">
    <nav>
      <aside
        class="hidden md:flex flex-col h-screen w-[250px] flex-shrink-0 justify-between border-r border-slate-4 dark:border-slate-700 bg-slate-1 px-4 pb-6"
      >
        <div class="flex items-center h-[60px]">
          <NuxtLink to="/" class="px-2 font-bold text-xl">微信公众号文章导出</NuxtLink>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex-1 mt-6">
          <ul class="flex flex-col gap-2">
            <li v-for="item in filteredItems" :key="item.name">
              <NuxtLink
                :to="item.href"
                class="flex h-8 items-center gap-2 rounded-md px-2 text-sm"
                :class="{
                  'text-slate-11 dark:text-slate-200 hover:bg-slate-4 dark:hover:bg-slate-800 hover:text-slate-12':
                    item.href !== route.fullPath,
                  'text-slate-12 dark:text-slate-200 bg-slate-3 dark:bg-slate-800 font-bold':
                    item.href === route.fullPath,
                }"
              >
                <div class="text-slate-11 opacity-80 w-[18px] h-[18px]">
                  <component :is="item.icon" class="w-full h-full dark:text-slate-50" />
                </div>
                <p>{{ item.name }}</p>
                <UBadge v-if="item.tags" v-for="tag in item.tags" color="fuchsia" variant="subtle">{{ tag }}</UBadge>
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- footer -->
        <footer class="flex flex-col space-y-2 pt-3 border-t dark:border-slate-600">
          <div v-if="loginAccount">
            <div class="flex items-center space-x-2">
              <img v-if="loginAccount.avatar" :src="loginAccount.avatar" alt="" class="rounded-full size-10" />
              <UTooltip
                v-if="loginAccount.nickname"
                class="flex-1 overflow-hidden"
                :popper="{ placement: 'top-start', offsetDistance: 16 }"
              >
                <template #text>
                  <span>{{ loginAccount.nickname }}</span>
                </template>
                <span class="whitespace-nowrap text-ellipsis overflow-hidden">{{ loginAccount.nickname }}</span>
              </UTooltip>

              <UButton
                icon="i-heroicons-arrow-left-start-on-rectangle-16-solid"
                :loading="logoutBtnLoading"
                class="bg-slate-10 hover:bg-rose-500 disabled:bg-rose-500"
                @click="logout"
                >退出
              </UButton>
            </div>
            <div class="text-sm">
              <span>登录信息过期时间还剩: </span>
              <span class="font-mono" :class="warning ? 'text-rose-500' : 'text-green-500'">{{ distance }}</span>
            </div>
            <StorageUsage class="mt-5" />
          </div>
          <div v-else>
            <UButton color="gray" variant="solid" @click="login">登录公众号</UButton>
          </div>
        </footer>
      </aside>
    </nav>
    <div class="flex flex-col flex-1 overflow-hidden h-screen">
      <div
        class="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-slate-6 dark:border-slate-600 px-6"
      >
        <div id="title"></div>

        <ul class="hidden md:flex items-center gap-5">
          <li class="text-slate-500 hover:text-slate-600 cursor-pointer">
            <UTooltip text="设置 Credentials">
              <GlobalCredentials />
            </UTooltip>
          </li>
          <li class="text-slate-500 hover:text-slate-600 cursor-pointer" @click="gotoLink(docsWebSite)">
            <UTooltip text="查看文档">
              <UIcon name="i-heroicons-book-open" class="size-8" />
            </UTooltip>
          </li>
          <li
            class="text-slate-500 hover:text-slate-600 cursor-pointer"
            @click="gotoLink('https://github.com/jooooock/wechat-article-exporter')"
          >
            <UTooltip text="GitHub">
              <UIcon name="i-grommet-icons:github" class="size-8" />
            </UTooltip>
          </li>
        </ul>
      </div>
      <div class="flex-1 overflow-hidden">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { File, Globe, Settings, HeartHandshake, Rss, Cable, Clock, LibraryBig, UsersRound } from 'lucide-vue-next';
import { formatDistance } from 'date-fns';
import type { LogoutResponse } from '~/types/types';
import { gotoLink } from '~/utils';
import { isInsider } from '~/config/insider';
import type { FunctionalComponent } from 'vue';
import { docsWebSite } from '~/config';
import GlobalCredentials from '~/components/global/Credentials.vue';
import LoginModal from '~/components/modal/Login.vue';
import StorageUsage from '~/components/StorageUsage.vue';

interface NavItem {
  name: string;
  icon: FunctionalComponent;
  href: string;
  insider?: boolean;
  tags?: string[];
}

const route = useRoute();

const loginAccount = useLoginAccount();

const modal = useModal();

const items = ref<NavItem[]>([
  { name: '公众号管理', icon: UsersRound, href: '/dashboard/account' },
  { name: '文章下载', icon: File, href: '/dashboard/article' },
  { name: '合集下载', icon: LibraryBig, href: '/dashboard/album' },
  { name: '公共代理', icon: Globe, href: '/dashboard/proxy' },
  { name: '订阅', icon: Rss, href: '/dashboard/subscribe' },
  { name: 'API', icon: Cable, href: '/dashboard/api', tags: ['内测'] },
  { name: '变更记录', icon: Clock, href: '/dashboard/changelog' },
  { name: '设置', icon: Settings, href: '/dashboard/settings' },
  { name: '技术支持 & 赞助', icon: HeartHandshake, href: '/dashboard/support' },
]);

const filteredItems = computed(() => {
  return items.value.filter(item => (isInsider.value ? true : !item.insider));
});

const now = ref(new Date());
const distance = computed(() => {
  return (
    loginAccount.value &&
    formatDistance(new Date(loginAccount.value.expires), now.value, {
      includeSeconds: true,
      locale: {
        formatDistance: function (token, count, options) {
          if (now.value >= new Date(loginAccount.value.expires)) {
            window.clearInterval(timer);
            return '已过期';
          }

          switch (token) {
            case 'aboutXHours':
              return '大约' + count + '个小时';
            case 'aboutXMonths':
              return '大约' + count + '个月';
            case 'aboutXWeeks':
              return '大约' + count + '周';
            case 'aboutXYears':
              return '大约' + count + '年';
            case 'lessThanXMinutes':
              return '小于' + count + '分钟';
            case 'almostXYears':
              return '接近' + count + '年';
            case 'halfAMinute':
              return '半分钟';
            case 'lessThanXSeconds':
              return '小于' + count + '秒';
            case 'overXYears':
              return '超过' + count + '年';
            case 'xDays':
              return count + '天';
            case 'xHours':
              return count + '个小时';
            case 'xMinutes':
              return count + '分钟';
            case 'xMonths':
              return count + '个月';
            case 'xSeconds':
              return count + '秒';
            case 'xWeeks':
              return count + '周';
            case 'xYears':
              return count + '年';
            default:
              return 'unknown';
          }
        },
      },
    })
  );
});
const warning = computed(() => {
  const value = distance.value;
  return value === '已过期' || value.includes('分钟') || value.includes('秒');
});

let timer: number;
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});
onUnmounted(() => {
  window.clearInterval(timer);
});

function login() {
  modal.open(LoginModal);
}

const logoutBtnLoading = ref(false);

async function logout() {
  logoutBtnLoading.value = true;
  const { statusCode, statusText } = await $fetch<LogoutResponse>('/api/logout?token=' + loginAccount.value.token);
  if (statusCode === 200) {
    loginAccount.value = null;
  } else {
    alert(statusText);
  }
  logoutBtnLoading.value = false;
}
</script>
