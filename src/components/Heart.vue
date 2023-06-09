<script setup lang="ts">
import { useCharacter } from '@/stores/useCharacter'
import { useMinesweeper } from '@/stores/useMinesweeper'
import { HP } from '@/constants'

defineProps<{
  countdown: number
}>()

const character = useCharacter()
const { hp } = toRefs(character)
const minesweeper = useMinesweeper()

watch(hp, () => {
  if (hp.value === 0) {
    minesweeper.setIsGameOver()
  }
})
</script>

<script lang="ts">
export default {
  name: 'heart',
}
</script>

<template>
  <div :class="['inline-block icon-list', { 'animate-pulse': countdown === 0 && !minesweeper.isVictory && hp }]">
    <i v-for="(heart, idx) in HP" :key="idx" :class="['nes-icon is-medium heart', { 'is-transparent': hp < heart }]" />
  </div>
</template>
