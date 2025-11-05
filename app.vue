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
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
import { isDev } from '~/config';

const runtimeConfig = useRuntimeConfig();

const websiteID = runtimeConfig.public.umamiWebsiteID;

ModuleRegistry.registerModules([AllEnterpriseModule]);
LicenseManager.setLicenseKey(runtimeConfig.public.aggridLicense);

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

console.log('this is a normal log message');
</script>

<style>
@import 'style.css';
</style>
