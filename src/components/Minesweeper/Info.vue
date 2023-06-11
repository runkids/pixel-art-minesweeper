<script setup lang="ts">
import { useGameController } from '@/composable/useGameController'

const countdown = inject('countdown', 0)

const { status } = useGameController()
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
