<template>
  <div
    class="fixed leading-5 flex justify-center items-center right-10 bottom-24 bg-gray-400 text-white font-bold font-sans shadow-md hover:shadow-lg disabled:shadow-none hover:ring disabled:ring-0 ring-blue-400 cursor-pointer rounded-full size-20 disabled:cursor-not-allowed"
    @click="autoLoadData"
  >
    <span v-if="autoLoading">加载中</span>
    <span v-else>自动<br />加载</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  bottomIndicatorEl: HTMLElement | null;
  noMoreData: boolean;
}
const props = defineProps<Props>();

const autoLoading = ref(false);
let autoLoadTimer: number | undefined = undefined;
function autoLoadData() {
  if (autoLoading.value || props.noMoreData) {
    cancelAutoLoad();
    return;
  }

  autoLoading.value = true;
  scrollToBottom();
}

function cancelAutoLoad() {
  window.clearTimeout(autoLoadTimer);
  autoLoading.value = false;
}

function scrollToBottom() {
  props.bottomIndicatorEl!.scrollIntoView({ behavior: 'smooth' });
}

function tick() {
  if (autoLoading.value) {
    autoLoadTimer = window.setTimeout(() => {
      scrollToBottom();
    }, 5000);
  } else {
    cancelAutoLoad();
  }
}

defineExpose({
  tick,
});
</script>
