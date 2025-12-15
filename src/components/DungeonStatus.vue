<script setup lang="ts">
import { dungeonStoreToRefs } from '@/stores/useDungeon'

const { floor, gold, level, exp, expToNextLevel, totalAttack, totalDefense, potions, keys, hasShield } = dungeonStoreToRefs()

// EXP bar percentage
const expPercent = computed(() => {
  return (exp.value / expToNextLevel.value) * 100
})
</script>

<template>
  <div class="dungeon-status">
    <!-- Floor & Level -->
    <div class="status-row">
      <div class="status-item floor">
        <span class="label">🏰</span>
        <span class="value">{{ floor }}F</span>
      </div>
      <div class="status-item level">
        <span class="label">⭐</span>
        <span class="value">Lv.{{ level }}</span>
      </div>
    </div>

    <!-- EXP Bar -->
    <div class="exp-container">
      <div class="exp-bar">
        <div class="exp-fill" :style="{ width: `${expPercent}%` }"></div>
      </div>
      <span class="exp-text">EXP: {{ exp }}/{{ expToNextLevel }}</span>
    </div>

    <!-- Stats -->
    <div class="status-row stats">
      <div class="status-item">
        <span class="stat-icon">⚔️</span>
        <span class="stat-value">{{ totalAttack }}</span>
      </div>
      <div class="status-item">
        <span class="stat-icon">🛡️</span>
        <span class="stat-value">{{ totalDefense }}</span>
      </div>
      <div class="status-item">
        <span class="stat-icon">💰</span>
        <span class="stat-value">{{ gold }}</span>
      </div>
    </div>

    <!-- Items -->
    <div class="status-row items">
      <div class="item-slot" :class="{ 'has-item': potions > 0 }">
        <span class="item-icon">🧪</span>
        <span class="item-count">{{ potions }}</span>
      </div>
      <div class="item-slot" :class="{ 'has-item': keys > 0 }">
        <span class="item-icon">🗝️</span>
        <span class="item-count">{{ keys }}</span>
      </div>
      <div class="item-slot shield-slot" :class="{ 'active': hasShield }">
        <span class="item-icon">🛡️</span>
        <span v-if="hasShield" class="shield-active">ON</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dungeon-status {
  @apply flex flex-col gap-2 p-3 bg-gray-900 border-2 border-gray-700;
  border-radius: 4px;
  min-width: 200px;
}

.status-row {
  @apply flex justify-between items-center gap-2;
}

.status-item {
  @apply flex items-center gap-1;

  &.floor, &.level {
    @apply px-2 py-1 bg-gray-800;
    border-radius: 4px;
  }
}

.label {
  @apply text-sm;
}

.value {
  @apply text-white font-bold text-sm;
}

.exp-container {
  @apply relative;
}

.exp-bar {
  @apply w-full h-3 bg-gray-800 border border-gray-600;
  border-radius: 2px;
  overflow: hidden;
}

.exp-fill {
  @apply h-full transition-all duration-500;
  background: linear-gradient(to right, #9333ea, #c084fc);
}

.exp-text {
  @apply text-[10px] text-gray-400 mt-1 block text-center;
}

.stats {
  @apply justify-center gap-4 mt-1;
}

.stat-icon {
  @apply text-sm;
}

.stat-value {
  @apply text-white text-sm font-bold;
}

.items {
  @apply justify-center gap-3 mt-1;
}

.item-slot {
  @apply flex flex-col items-center p-1 bg-gray-800 rounded;
  @apply opacity-50 transition-opacity;
  min-width: 40px;

  &.has-item, &.active {
    @apply opacity-100;
  }
}

.item-icon {
  @apply text-lg;
}

.item-count {
  @apply text-[10px] text-gray-400;
}

.shield-slot {
  &.active {
    @apply bg-blue-900 border border-blue-500;
    animation: shield-glow 1s infinite alternate;

    .item-icon {
      animation: shield-pulse 0.5s infinite alternate;
    }
  }
}

.shield-active {
  @apply text-[8px] text-blue-400 font-bold;
}

@keyframes shield-glow {
  from { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
  to { box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); }
}

@keyframes shield-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
</style>
