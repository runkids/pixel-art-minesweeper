<script setup lang="ts">
defineProps<{
  flags: number
  timer: string
}>()
</script>

<script lang="ts">
export default {
  name: 'minesweeper-title',
}
</script>

<template>
  <div class="title">
    <div class="flex items-center justify-between gap-x-10">
      <span class="flex items-center gap-2">
        <Twemoji emoji="flag" />
        {{ flags }}
      </span>
      <span>Time: {{ timer }}</span>
    </div>
  </div>
</template>
