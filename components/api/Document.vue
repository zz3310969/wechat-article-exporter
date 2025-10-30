<script setup lang="ts">
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/stackoverflow-dark.css';

hljs.registerLanguage('json', json);

interface TParam {
  name: string;
  location: string;
  label: string;
  required: boolean;
  default: string;
  type: string;
  remark: string;
}

interface Props {
  index: number;
  name: string;
  description: string;
  url: string;
  method: string;
  params: TParam[];
  responseSample: any;
  remark?: string;
}
const props = defineProps<Props>();

const response_sample = computed(
  () => hljs.highlight(JSON.stringify(props.responseSample, null, 2), { language: 'json' }).value
);
const open = ref(false);
</script>

<template>
  <div class="space-y-5">
    <h2 class="text-2xl font-semibold font-serif py-2">{{ index }}. {{ name }}</h2>
    <div>
      <p class="font-semibold mb-2">简要描述</p>
      <p class="font-serif">{{ description }}</p>
    </div>
    <div>
      <p class="font-semibold mb-2">请求URL:</p>
      <p class="font-mono border p-2 rounded-md">{{ url }}</p>
    </div>
    <div>
      <p class="font-semibold mb-2">请求方式:</p>
      <p class="font-mono border p-2 rounded-md">{{ method }}</p>
    </div>
    <div>
      <p class="font-semibold mb-2">参数:</p>
      <div class="border rounded-md overflow-hidden">
        <table class="font-mono">
          <thead>
            <tr>
              <th>参数名</th>
              <th>参数位置</th>
              <th>强制</th>
              <th>默认值</th>
              <th>类型</th>
              <th>说明</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in params" :key="p.name">
              <td>{{ p.name }}</td>
              <td>{{ p.location }}</td>
              <td>{{ p.required ? '是' : '否' }}</td>
              <td>{{ p.default }}</td>
              <td>{{ p.type }}</td>
              <td>{{ p.label }}</td>
              <td>{{ p.remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <p class="font-semibold flex items-center mb-2">
        <span class="mr-3">返回示例:</span>
        <UToggle v-model="open" color="fuchsia" on-icon="i-heroicons:eye" off-icon="i-heroicons:eye-slash" />
      </p>
      <pre
        v-if="open"
        class="bg-black text-gray-400 p-2 max-h-[664px] overflow-scroll no-scrollbar"
      ><span v-html="response_sample"></span></pre>
    </div>
    <div v-if="remark">
      <p class="font-semibold mb-2">备注:</p>
      <p>{{ remark }}</p>
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: center;
}
thead {
  background-color: #00005506;
}
tr:nth-child(even) {
  background-color: #00005506;
}
</style>
