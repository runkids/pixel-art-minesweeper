<script setup lang="ts">
import { useGameStatus } from '@/composable/useGameStatus'

const countdown = inject('countdown', 0)

const { status } = useGameStatus()
</script>

<script lang="ts">
export default {
  name: 'minesweeper-info',
}
</script>

<template>
  <div class="title">
    <div class="flex items-center gap-x-10 text-white">
      <span class="flex items-center gap-2">
        <Twemoji emoji="flag" />
        {{ status.flags }}
      </span>
      <span>Time: {{ countdown }}s</span>
    </div>
  </div>
</template>
