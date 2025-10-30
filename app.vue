<template>
  <div :class="isDev ? 'debug-screens' : ''" class="flex flex-col h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
    <UModals />
  </div>
</template>

<script setup lang="ts">
const isDev = !import.meta.env.PROD;
const runtimeConfig = useRuntimeConfig();

const websiteID = runtimeConfig.public.umamiWebsiteID;

useHead({
  script: [
    websiteID
      ? {
          src: 'https://cloud.umami.is/script.js',
          defer: true,
          'data-website-id': websiteID,
        }
      : '',
  ],
});
</script>

<style>
body {
  overscroll-behavior: none; /* 阻止滚动到页面边缘的效果 */
}
::selection {
  background-color: yellow;
  color: black;
}
.highlight {
  color: red;
}
.ag-header-cell-label {
  justify-content: center;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
