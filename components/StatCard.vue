<script setup lang="ts">
interface StatItem {
  name: string;
  value: number;
}
interface Props {
  title: string;
  items: StatItem[];
}
defineProps<Props>();
</script>

<template>
  <div class="flex-1 border p-4 rounded-lg">
    <h3 class="font-medium text-2xl text-center mb-5">{{ title }}</h3>
    <div class="flex justify-around">
      <div v-for="item in items" :key="item.name">
        <p class="font-medium">{{ item.name }}</p>
        <p class="font-mono font-bold text-2xl">{{ item.value }}</p>
      </div>
    </div>
  </div>
</template>
