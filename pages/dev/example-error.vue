<template>
  <button id="errorBtn" @click="triggerClientError">Throw Client Error</button>
</template>

<script setup>
function triggerClientError() {
  throw new Error('Nuxt Button Error');
}
</script>
