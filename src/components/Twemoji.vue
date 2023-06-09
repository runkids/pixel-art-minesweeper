<script setup lang="ts">
defineProps<{
  emoji: 'flag' | 'mine'
}>()
</script>

<script lang="ts">
export default {
  name: 'tw-emoji',
}
</script>

<template>
  <img v-if="emoji === 'mine'" class="nes-avatar" src="http://twemoji.maxcdn.com/36x36/1f4a3.png" />
  <img v-if="emoji === 'flag'" class="nes-avatar" src="http://twemoji.maxcdn.com/36x36/1f6a7.png" />
</template>

<style lang="scss" scoped>
.nes-avatar {
  @apply w-5 h-5 flex-shrink-0 inline-block;
  image-rendering: pixelated;
}
</style>
