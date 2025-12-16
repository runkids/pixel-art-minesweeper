<script setup lang="ts">
defineProps<{
  emoji: 'flag' | 'mine' | 'chest' | 'monster' | 'boss' | 'potion' | 'key' | 'shield' | 'sword' | 'star'
}>()
</script>

<script lang="ts">
export default {
  name: 'tw-emoji',
}
</script>

<template>
  <img v-if="emoji === 'mine'" class="nes-avatar" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f4a3.png" />
  <img v-if="emoji === 'flag'" class="nes-avatar" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f6a9.png" />
  <img v-if="emoji === 'chest'" class="nes-avatar treasure" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f381.png" />
  <img v-if="emoji === 'monster'" class="nes-avatar" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f47e.png" />
  <img v-if="emoji === 'boss'" class="nes-avatar boss" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f479.png" />
  <img v-if="emoji === 'potion'" class="nes-avatar" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f9ea.png" />
  <img v-if="emoji === 'key'" class="nes-avatar" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f5dd-fe0f.png" />
  <img v-if="emoji === 'shield'" class="nes-avatar" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/1f6e1-fe0f.png" />
  <img v-if="emoji === 'sword'" class="nes-avatar" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/2694-fe0f.png" />
  <img v-if="emoji === 'star'" class="nes-avatar star" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/2b50.png" />
</template>

<style lang="scss" scoped>
.nes-avatar {
  @apply w-5 h-5 flex-shrink-0 inline-block;
  image-rendering: pixelated;

  &.treasure {
    animation: treasure-bounce 0.5s infinite alternate;
  }

  &.boss {
    animation: boss-shake 0.3s infinite;
  }

  &.star {
    animation: star-spin 2s linear infinite;
  }
}

@keyframes treasure-bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-3px); }
}

@keyframes boss-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes star-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
