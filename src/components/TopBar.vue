<script setup lang="ts">
import { useGameStatus } from '@/composable/useGameStatus'

const { status } = useGameStatus()
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
    <span class="text-white text-xl">Rank:{{ status.rank }}</span>
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
