// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@vueuse/nuxt', '@nuxt/ui'],
  ssr: false,
  runtimeConfig: {
    public: {
      umamiWebsiteID: '',
    },
  },
  app: {
    head: {
      meta: [
        {
          name: 'referrer',
          content: 'no-referrer',
        },
      ],
      script: [
        {
          src: '/vendors/html-docx-js@0.3.1/html-docx.js',
          defer: true,
        },
      ],
    },
  },
  nitro: {
    storage: {
      kv: {
        driver: 'cloudflare-kv-binding',
      },
    },
    devStorage: {
      kv: {
        driver: 'fs',
        base: './.data/kv',
      },
    },
  },
});
