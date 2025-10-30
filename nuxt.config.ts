// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
  },
  modules: ['@vueuse/nuxt', '@nuxt/ui', 'nuxt-monaco-editor'],
  ssr: false,
  runtimeConfig: {
    public: {
      umamiWebsiteID: '',
      aggridLicense: '',
    },
    debugMpRequest: false,
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
  sourcemap: process.env.NODE_ENV !== 'production',
  nitro: {
    minify: process.env.NODE_ENV === 'production',
    storage: {
      kv: {
        driver: process.env.NITRO_KV_DRIVER || 'memory',
        base: process.env.NITRO_KV_BASE || '.data/kv',
      },
    },
    devStorage: {
      kv: {
        driver: 'fs',
        base: '.data/kv',
      },
    },
  },
  monacoEditor: {
    locale: 'en', // 编辑器语言（支持 zh 等）
    componentName: {
      codeEditor: 'MonacoEditor', // 普通编辑器组件名
      diffEditor: 'MonacoDiffEditor', // 差异编辑器组件名
    },
  },
});
