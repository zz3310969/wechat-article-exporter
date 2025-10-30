<template>
  <div
    ref="draggableCircle"
    class="fixed top-0 right-0 z-10 cursor-pointer"
    :class="{ 'transition-all duration-500': !isDragging }"
    @mousedown="startDrag"
    @mouseup="handleMouseUp"
    :style="{ top: `${position.top}px`, left: `${position.left}px` }"
  >
    <slot>
      <UIcon
        name="i-famicons:grid-sharp"
        class="size-10"
        :class="
          status === 'active'
            ? 'bg-blue-500'
            : status === 'inactive'
              ? 'bg-gray-400'
              : status === 'warning'
                ? 'bg-orange-500'
                : ''
        "
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Position {
  top: number;
  left: number;
}

interface Offset {
  x: number;
  y: number;
}

interface Props {
  status: 'active' | 'inactive' | 'warning';
}
defineProps<Props>();
const emit = defineEmits(['click']);

const draggableCircle = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);
const position = reactive<Position>({ top: 180, left: window.innerWidth - 68 });
const offset = reactive<Offset>({ x: 0, y: 0 });
const startPosition = reactive<Position>({ top: 0, left: 0 });
const dragThreshold = 10; // 设置一个阈值，判断是否为拖动

const startDrag = (event: MouseEvent) => {
  isDragging.value = true;
  startPosition.top = event.clientY;
  startPosition.left = event.clientX;
  offset.x = event.clientX - position.left;
  offset.y = event.clientY - position.top;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.body.style.userSelect = 'none'; // 禁用文本选择
};

const onDrag = (event: MouseEvent) => {
  if (isDragging.value) {
    position.left = event.clientX - offset.x;
    position.top = event.clientY - offset.y;
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.body.style.userSelect = ''; // 启用文本选择

  // 检查位置并移动到最近的角落
  const windowWidth = window.innerWidth;
  const halfWindowWidth = windowWidth / 2;
  if (position.left < halfWindowWidth) {
    position.left = 10; // 移动到左边角落
  } else {
    position.left = windowWidth - 48 - 20; // 移动到右边角落
  }
};

const handleMouseUp = (event: MouseEvent) => {
  const dragDistance = Math.sqrt(
    Math.pow(event.clientX - startPosition.left, 2) + Math.pow(event.clientY - startPosition.top, 2)
  );

  if (dragDistance < dragThreshold) {
    emit('click');
  }
};

onMounted(() => {
  draggableCircle.value?.addEventListener('mousedown', startDrag);
});

onBeforeUnmount(() => {
  draggableCircle.value?.removeEventListener('mousedown', startDrag);
});
</script>
