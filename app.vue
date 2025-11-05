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
import * as Sentry from '@sentry/nuxt';

const isDev = !import.meta.env.PROD;
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

Sentry.captureMessage('client:cookie store load success.', 'info');
Sentry.logger.info('client:cookie store load success.', { log_source: 'sentry_test' });
</script>

<style>
@import 'style.css';
</style>
