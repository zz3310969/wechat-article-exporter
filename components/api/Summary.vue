<script setup lang="ts">
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/stackoverflow-dark.css';
import AuthModal from '~/components/api/Auth.vue';
import type { Preferences } from '~/types/preferences';
import usePreferences from '~/composables/usePreferences';

hljs.registerLanguage('json', json);

const modal = useModal();

const preferences: Ref<Preferences> = usePreferences() as unknown as Ref<Preferences>;
const currentAuth = computed(() => {
  return preferences.value.api_auth
    ? hljs.highlight(JSON.stringify(preferences.value.api_auth, null, 2), { language: 'json' }).value
    : null;
});
function auth() {
  modal.open(AuthModal);
}
</script>

<template>
  <div>
    <p>
      为了方便第三方开发人员进行个性化定制，本网站将其主要功能（包括但不限于公众号查询、历史文章列表查询、文章下载等）提供
      API 以供接入。
    </p>
    <p class="italic text-rose-500 mt-3">注意：目前接入 API 免费，后续会根据实际情况动态调整，不排除会改为收费模式。</p>
    <p class="italic text-rose-500 mt-3">
      目前该功能为测试阶段，函数签名及授权方式等都有可能发生变化，请时刻关注更新。
    </p>

    <h2 class="mt-10 text-2xl font-bold">关于授权</h2>
    <p>由于微信公众号本身的限制，授权有效期最长为 4 天，且只能扫码登录进行授权，无法通过账号密码进行登录。</p>
    <p>
      以下所有 <code>API</code> 如无特殊说明，均需要携带授权信息（放在 <code>Authorization</code> 请求头中）进行调用。
    </p>
    <p class="mt-3">获取授权信息的方式为点击下面的按钮进行公众号登录：</p>
    <UButton color="fuchsia" @click="auth">开始授权</UButton>
    <div v-if="currentAuth">
      <p class="mt-3">当前授权:</p>
      <pre class="bg-black text-gray-400 p-2 overflow-scroll no-scrollbar"><span v-html="currentAuth"></span></pre>
    </div>
  </div>
</template>
