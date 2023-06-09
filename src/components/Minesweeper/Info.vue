<script setup lang="ts">
import { useMinesweeper } from '@/stores/useMinesweeper'

defineProps<{
  timer: number
}>()

const { flags } = toRefs(useMinesweeper())
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
        {{ flags }}
      </span>
      <span>Time: {{ timer }}s</span>
    </div>
  </div>
</template>
