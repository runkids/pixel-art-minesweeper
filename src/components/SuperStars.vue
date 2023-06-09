<script setup lang="ts">
import { useCharacter } from '@/stores/useCharacter'

const character = useCharacter()
const { items } = toRefs(character)
</script>

<script lang="ts">
export default {
  name: 'super-stars',
}
</script>

<template>
  <div class="flex items-center justify-end gap-x-2 w-1/3 cursor-pointer">
    <i class="nes-icon star" />
    <span class="text-white">X {{ items.superStar }}</span>
  </div>
</template>
