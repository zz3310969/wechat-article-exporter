<template>
  <div class="h-full">
    <Teleport defer to="#title">
      <h1 class="text-[28px] leading-[34px] text-slate-12 dark:text-slate-50 font-bold">公共代理</h1>
    </Teleport>

    <div class="flex flex-col h-full divide-y divide-gray-200">
      <!-- header -->
      <header class="flex justify-between items-center px-4 py-5 sm:px-6">
        <h2 class="text-2xl font-semibold">运行状况</h2>

        <p class="font-serif font-bold">可用: {{ totalSuccess }}，不可用: {{ totalFailure }}</p>
      </header>

      <!-- 数据展示区 -->
      <div class="flex-1 px-4 py-5 sm:py-6 overflow-y-scroll">
        <div v-if="loading" class="flex justify-center items-center mt-5">
          <Loader :size="28" class="animate-spin text-slate-500" />
        </div>
        <ProxyMetrics :data="metricsData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader } from 'lucide-vue-next';
import { websiteName } from '~/config';
import type { AccountMetric } from '~/types/proxy';
import ProxyMetrics from '~/components/ProxyMetrics.vue';

useHead({
  title: `公共代理 | ${websiteName}`,
});

const loading = ref(false);
const metricsData = ref<AccountMetric[]>([]);

const totalSuccess = computed(
  () => metricsData.value.filter(item => item.metric && item.metric.dailyRequests < 100_000).length
);
const totalFailure = computed(
  () => metricsData.value.filter(item => item.metric && item.metric.dailyRequests >= 100_000).length
);

async function getMetricsData() {
  loading.value = true;
  try {
    metricsData.value = await fetch('/api/web/misc/status').then(res => res.json());
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}
getMetricsData();
</script>
