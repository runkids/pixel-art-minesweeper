<script setup lang="ts">
import { computed } from 'vue'
import { type Treasure } from '@/stores/useDungeon'

const props = defineProps<{
  modelValue: boolean
  treasure: Treasure | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'collect'): void
}>()

const handleCollect = () => {
  emit('collect')
  emit('update:modelValue', false)
}

const treasureTypeText = computed(() => {
  if (!props.treasure) return ''
  switch (props.treasure.type) {
    case 'gold': return 'Gold'
    case 'potion': return 'Potion'
    case 'key': return 'Key'
    case 'skill': return 'Skill Scroll'
    default: return 'Treasure'
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="treasure-appear">
      <div v-if="modelValue && treasure" class="treasure-overlay" @click="handleCollect">
        <div class="treasure-dialog nes-container is-rounded is-dark" @click.stop>
          <div class="treasure-animation">
            <div class="chest-opening">
              <span class="chest-emoji">🎁</span>
              <div class="sparkles">
                <span v-for="i in 8" :key="i" class="sparkle">✨</span>
              </div>
            </div>
          </div>

          <h3 class="treasure-title">Treasure Found!</h3>

          <div class="treasure-content">
            <span class="treasure-emoji">{{ treasure.emoji }}</span>
            <span class="treasure-name">{{ treasure.name }}</span>
            <span class="treasure-type">({{ treasureTypeText }})</span>
          </div>

          <p class="treasure-description">{{ treasure.description }}</p>

          <div class="treasure-value">
            <template v-if="treasure.type === 'gold'">
              +{{ treasure.value }} 💰
            </template>
            <template v-else-if="treasure.type === 'potion'">
              Restore {{ treasure.value }} HP
            </template>
            <template v-else>
              +1
            </template>
          </div>

          <button class="nes-btn is-success collect-btn" @click="handleCollect">
            Collect!
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.treasure-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.treasure-dialog {
  text-align: center;
  padding: 24px;
  min-width: 300px;
}

.treasure-animation {
  margin-bottom: 16px;
}

.chest-opening {
  position: relative;
  display: inline-block;
}

.chest-emoji {
  font-size: 64px;
  display: block;
  animation: chest-bounce 0.5s ease infinite alternate;
}

@keyframes chest-bounce {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-10px) scale(1.1); }
}

.sparkles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
}

.sparkle {
  position: absolute;
  font-size: 16px;
  animation: sparkle-fly 1s ease-out infinite;

  @for $i from 1 through 8 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.1}s;
      transform: rotate(#{$i * 45}deg) translateY(-40px);
    }
  }
}

@keyframes sparkle-fly {
  0% {
    opacity: 0;
    transform: rotate(var(--rotation)) translateY(0);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--rotation)) translateY(-60px);
  }
}

.treasure-title {
  font-size: 20px;
  color: #ffd700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 0 #000;
}

.treasure-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.treasure-emoji {
  font-size: 32px;
}

.treasure-name {
  font-size: 16px;
  color: #fff;
  font-weight: bold;
}

.treasure-type {
  font-size: 12px;
  color: #888;
}

.treasure-description {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 16px;
}

.treasure-value {
  font-size: 24px;
  color: #ffd700;
  margin-bottom: 16px;
  animation: value-pulse 0.5s ease infinite alternate;
}

@keyframes value-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.collect-btn {
  animation: btn-glow 1s ease infinite;
}

@keyframes btn-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.8); }
}

.treasure-appear-enter-active {
  animation: treasure-pop 0.4s ease-out;
}

.treasure-appear-leave-active {
  animation: treasure-fade 0.2s ease-out;
}

@keyframes treasure-pop {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes treasure-fade {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
