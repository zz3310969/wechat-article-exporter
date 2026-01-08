<template>
  <div class="flex flex-wrap gap-x-10 gap-y-5">
    <div
      v-for="account in accountMetrics"
      :key="account.name"
      class="relative w-full max-w-2xl border p-5 rounded-md hover:shadow"
    >
      <h3 class="text-xl text-gray-600 font-mono mb-3">节点: {{ account.domain }}</h3>
      <UMeter v-if="account.metric" :value="account.metric.dailyRequests" :max="100_000" color="orange">
        <template #indicator>
          <div class="flex justify-between items-center text-gray-400">
            <span>今日请求量</span>
            <p>
              <span class="text-base text-green-500 font-semibold font-mono">
                {{ Math.round((Math.min(account.metric.dailyRequests, 100_000) / 100_000) * 100) }}%
              </span>
              <span class="font-mono text-xs">
                ({{ account.metric === null ? '未知' : account.metric.dailyRequests.toLocaleString('en-US') }}/{{
                  (100_000).toLocaleString('en-US')
                }})
              </span>
            </p>
          </div>
        </template>
      </UMeter>
      <span v-else>状态未知</span>
      <div class="absolute right-3 top-3">
        <UIcon
          v-if="account.copied"
          name="i-lucide:check"
          class="size-5 text-gray-500 hover:text-gray-400 cursor-pointer"
        />
        <UTooltip v-else text="复制节点地址">
          <UIcon
            name="i-lucide:copy"
            class="size-5 text-gray-500 hover:text-gray-400 cursor-pointer"
            @click="copyAddress(account)"
          />
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AccountMetric } from '~/types/proxy';

interface Props {
  data: AccountMetric[];
}
interface AccountMetricWithExtra extends AccountMetric {
  copied: boolean;
}

const props = defineProps<Props>();

const accountMetrics: AccountMetricWithExtra[] = reactive(
  props.data.map((account: AccountMetric) => ({ ...account, copied: false }))
);

function copyAddress(account: AccountMetric & { copied: boolean }) {
  let result: string[] = [];
  for (let i = 0; i < 16; i++) {
    result.push(`https://${('0' + i).slice(-2)}${account.domain.replace(/^\*/, '')}`);
  }
  navigator.clipboard.writeText(result.join('\n'));

  account.copied = true;
  setTimeout(() => {
    account.copied = false;
  }, 1000);
}
</script>
