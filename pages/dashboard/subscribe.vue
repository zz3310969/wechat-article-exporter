<template>
  <div class="flex flex-col h-full">
    <Teleport defer to="#title">
      <UChip text="计划中" size="2xl">
        <h1 class="text-[28px] leading-[34px] text-slate-12 dark:text-slate-50 font-bold">订阅</h1>
      </UChip>
    </Teleport>
    <div class="px-6 flex-1 overflow-scroll">
      <p>订阅自动下载</p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '订阅 | 微信公众号文章导出',
});
</script>
