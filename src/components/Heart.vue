<script setup lang="ts">
import { HP } from '@/constants'
import { useGameStatus } from '@/composable/useGameStatus'

const countdown = inject('countdown', 0)

const { status } = useGameStatus()
</script>

<script lang="ts">
export default {
  name: 'heart',
}
</script>

<template>
  <div :class="['inline-block icon-list', { 'animate-pulse': countdown === 0 && !status.isVictory && status.hp }]">
    <i
      v-for="(heart, idx) in HP"
      :key="idx"
      :class="['nes-icon is-medium heart', { 'is-transparent': status.hp < heart }]"
    />
  </div>
</template>
