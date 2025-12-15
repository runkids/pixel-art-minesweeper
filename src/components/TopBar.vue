<script setup lang="ts">
import { useGameStatus } from '@/composable/useGameStatus'
import { dungeonStoreToRefs } from '@/stores/useDungeon'

const { status } = useGameStatus()
const { floor, level, gold, hasShield } = dungeonStoreToRefs()
</script>

<script lang="ts">
export default {
  name: 'TopBar',
}
</script>

<template>
  <div class="flex flex-col gap-y-2 w-1/3">
    <Heart />
    <MinesweeperInfo />
  </div>
  <div class="flex-1 flex flex-col items-center justify-center">
    <!-- Dungeon info -->
    <div class="dungeon-info">
      <span class="floor-badge">🏰 {{ floor }}F</span>
      <span class="level-badge">⭐ Lv.{{ level }}</span>
      <span class="gold-badge">💰 {{ gold }}</span>
    </div>

    <span class="text-white text-xl">Rank:{{ status.rank }}</span>

    <!-- Shield indicator -->
    <div v-if="hasShield" class="shield-active-indicator">
      🛡️ 護盾啟動中
    </div>

    <h2 v-if="status.isGameOver" class="mt-5 text-xl text-red-600 select-none animate-bounce">{{ 'GAME OVER' }}</h2>
    <h2 v-if="status.isVictory" class="mt-5 text-xl text-yellow-600 select-none animate-pulse">
      {{ 'COMPLETE!' }}
    </h2>
  </div>
  <SuperStars />
  <a
    class="nes-icon github is-medium cursor-pointer ml-4 animate-pulse"
    href="https://github.com/runkids/pixel-art-minesweeper"
    target="_blank"
  />
</template>

<style lang="scss" scoped>
.dungeon-info {
  @apply flex gap-3 mb-2;
}

.floor-badge, .level-badge, .gold-badge {
  @apply px-2 py-1 text-xs rounded;
  @apply bg-gray-800 text-white;
}

.floor-badge {
  @apply bg-purple-900;
}

.level-badge {
  @apply bg-blue-900;
}

.gold-badge {
  @apply bg-yellow-900;
}

.shield-active-indicator {
  @apply mt-2 px-3 py-1 text-sm text-blue-300 bg-blue-900 rounded;
  animation: shield-pulse 1s infinite;
}

@keyframes shield-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
  50% { opacity: 0.7; box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
}
</style>
