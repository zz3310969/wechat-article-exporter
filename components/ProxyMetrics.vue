<template>
  <div class="flex flex-wrap gap-x-10 gap-y-5">
    <div
      v-for="account in data"
      :key="account.name"
      class="relative w-full max-w-2xl border p-5 rounded-md hover:shadow"
    >
      <h3 class="text-xl text-gray-600 font-mono mb-3">域名: {{ account.domain }}</h3>
      <UMeter v-if="account.metric" :value="account.metric.dailyRequests" :max="100_000" color="orange">
        <template #indicator>
          <div class="flex justify-between items-center text-sm text-gray-400">
            <span>今日请求量</span>
            <p>
              <span class="text-base text-black font-mono">
                {{ account.metric === null ? '未知' : account.metric.dailyRequests.toLocaleString('en-US') }}/{{
                  (100_000).toLocaleString('en-US')
                }}
              </span>
              <span class="ml-3">
                ({{ Math.round((Math.min(account.metric.dailyRequests, 100_000) / 100_000) * 100) }}%)
              </span>
            </p>
          </div>
        </template>
      </UMeter>
      <span v-else>状态未知</span>
      <UButton class="absolute top-3 right-3" color="gray" @click="copyAddress(account.domain)">复制节点地址</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AccountMetric } from '~/types/proxy';
import toastFactory from '~/composables/toast';

interface Props {
  data: AccountMetric[];
}

defineProps<Props>();

const toast = toastFactory();

function copyAddress(domain: string) {
  let result: string[] = [];
  for (let i = 0; i < 16; i++) {
    result.push(`https://${('0' + i).slice(-2)}${domain.replace(/^\*/, '')}`);
  }
  navigator.clipboard.writeText(result.join('\n'));
  toast.info('节点地址复制成功');
}
</script>
