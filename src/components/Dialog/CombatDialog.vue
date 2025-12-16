<script setup lang="ts">
import { computed } from 'vue'
import { useDungeon, dungeonStoreToRefs } from '@/stores/useDungeon'
import { characterStoreToRefs } from '@/stores/useCharacter'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'victory', rewards: { exp: number; gold: number }): void
  (e: 'defeat'): void
  (e: 'flee'): void
  (e: 'playerDamaged', damage: number): void
}>()

const dungeon = useDungeon()
const { currentMonster, combatLog, totalAttack, totalDefense } = dungeonStoreToRefs()

const { hp } = characterStoreToRefs()

// Monster HP bar percentage
const monsterHpPercent = computed(() => {
  if (!currentMonster.value) return 0
  return (currentMonster.value.hp / currentMonster.value.maxHp) * 100
})

// Combat animations
const isAttacking = ref(false)
const isMonsterAttacking = ref(false)
const showDamageNumber = ref(false)
const damageNumber = ref(0)
const showMonsterDamage = ref(false)
const monsterDamage = ref(0)

// Attack action
const handleAttack = async () => {
  if (isAttacking.value || isMonsterAttacking.value) return

  // Player attacks
  isAttacking.value = true
  await new Promise(resolve => setTimeout(resolve, 300))

  const result = dungeon.attackMonster()
  showMonsterDamage.value = true
  monsterDamage.value = result.damage

  await new Promise(resolve => setTimeout(resolve, 400))
  showMonsterDamage.value = false
  isAttacking.value = false

  if (result.killed) {
    // Victory!
    emit('victory', result.rewards!)
    emit('update:modelValue', false)
    return
  }

  // Monster counter-attacks
  await new Promise(resolve => setTimeout(resolve, 200))
  isMonsterAttacking.value = true

  await new Promise(resolve => setTimeout(resolve, 300))
  const monsterDmg = dungeon.monsterAttack()

  if (monsterDmg > 0) {
    showDamageNumber.value = true
    damageNumber.value = monsterDmg
    emit('playerDamaged', monsterDmg)
  }

  await new Promise(resolve => setTimeout(resolve, 400))
  showDamageNumber.value = false
  isMonsterAttacking.value = false

  // Check if player defeated
  if (hp.value - monsterDmg <= 0) {
    emit('defeat')
    emit('update:modelValue', false)
  }
}

// Flee action (50% chance)
const handleFlee = async () => {
  if (Math.random() > 0.5) {
    // Flee successful
    combatLog.value.push('Escaped successfully!')
    emit('flee')
    emit('update:modelValue', false)
  } else {
    // Flee failed, monster attacks
    combatLog.value.push('Escape failed!')
    isMonsterAttacking.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    const monsterDmg = dungeon.monsterAttack()
    if (monsterDmg > 0) {
      showDamageNumber.value = true
      damageNumber.value = monsterDmg
      emit('playerDamaged', monsterDmg)
    }

    await new Promise(resolve => setTimeout(resolve, 400))
    showDamageNumber.value = false
    isMonsterAttacking.value = false
  }
}

</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="combat-overlay">
        <div class="nes-container is-rounded is-dark combat-dialog">
          <!-- Monster area -->
          <div class="monster-area" :class="{ 'shake': isAttacking }">
            <div v-if="currentMonster" class="monster-display">
              <div class="monster-emoji" :class="{ 'attack-animation': isMonsterAttacking }">
                {{ currentMonster.emoji }}
              </div>
              <div class="monster-info">
                <div class="monster-name">
                  {{ currentMonster.name }}
                  <span v-if="currentMonster.isBoss" class="boss-badge">BOSS</span>
                </div>
                <div class="monster-hp-bar">
                  <div class="hp-fill" :style="{ width: `${monsterHpPercent}%` }"></div>
                </div>
                <div class="monster-hp-text">
                  HP: {{ currentMonster.hp }} / {{ currentMonster.maxHp }}
                </div>
              </div>

              <!-- Damage number -->
              <Transition name="damage-pop">
                <div v-if="showMonsterDamage" class="damage-number monster-damage">
                  -{{ monsterDamage }}
                </div>
              </Transition>
            </div>
          </div>

          <!-- Combat log -->
          <div class="combat-log">
            <div v-for="(log, idx) in combatLog.slice(-4)" :key="idx" class="log-entry">
              {{ log }}
            </div>
          </div>

          <!-- Player damage indicator -->
          <Transition name="damage-pop">
            <div v-if="showDamageNumber" class="damage-number player-damage">
              -{{ damageNumber }}
            </div>
          </Transition>

          <!-- Player stats -->
          <div class="player-stats">
            <div class="stat">
              <span class="stat-icon">⚔️</span>
              <span>Attack: {{ totalAttack }}</span>
            </div>
            <div class="stat">
              <span class="stat-icon">🛡️</span>
              <span>Defense: {{ totalDefense }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="combat-actions">
            <button
              class="nes-btn is-error"
              :disabled="isAttacking || isMonsterAttacking"
              @click="handleAttack"
            >
              ⚔️ Attack
            </button>
            <button
              class="nes-btn is-warning"
              :disabled="isAttacking || isMonsterAttacking"
              @click="handleFlee"
            >
              🏃 Flee
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.combat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.combat-dialog {
  width: 90%;
  max-width: 400px;
  padding: 20px;
}

.monster-area {
  text-align: center;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;

  &.shake {
    animation: combat-shake 0.3s ease-in-out;
  }
}

@keyframes combat-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.monster-display {
  position: relative;
}

.monster-emoji {
  font-size: 64px;
  margin-bottom: 12px;
  display: inline-block;
  transition: transform 0.3s;

  &.attack-animation {
    animation: monster-attack 0.3s ease-in-out;
  }
}

@keyframes monster-attack {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(20px) scale(1.2); }
  100% { transform: translateY(0) scale(1); }
}

.monster-info {
  text-align: center;
}

.monster-name {
  font-size: 16px;
  color: #fff;
  margin-bottom: 8px;
}

.boss-badge {
  background: linear-gradient(45deg, #ff0000, #ff6600);
  color: #fff;
  padding: 2px 8px;
  font-size: 10px;
  border-radius: 4px;
  margin-left: 8px;
  animation: boss-pulse 1s infinite;
}

@keyframes boss-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.monster-hp-bar {
  width: 200px;
  height: 16px;
  background: #333;
  border: 2px solid #fff;
  margin: 0 auto 8px;
  position: relative;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  background: linear-gradient(to right, #ff0000, #ff4444);
  transition: width 0.3s ease;
}

.monster-hp-text {
  font-size: 12px;
  color: #aaa;
}

.damage-number {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 2px 2px 0 #000;

  &.monster-damage {
    color: #ff4444;
    top: 10%;
    right: 20%;
  }

  &.player-damage {
    color: #ff0000;
    bottom: 30%;
    left: 50%;
    transform: translateX(-50%);
  }
}

.damage-pop-enter-active {
  animation: damage-pop 0.4s ease-out;
}

.damage-pop-leave-active {
  animation: damage-fade 0.2s ease-out;
}

@keyframes damage-pop {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translateY(-10px) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px) scale(1);
    opacity: 1;
  }
}

@keyframes damage-fade {
  from { opacity: 1; }
  to { opacity: 0; }
}

.combat-log {
  background: #1a1a1a;
  border: 2px solid #444;
  padding: 12px;
  margin-bottom: 16px;
  min-height: 80px;
  max-height: 100px;
  overflow-y: auto;
}

.log-entry {
  font-size: 11px;
  color: #ccc;
  margin-bottom: 4px;

  &:last-child {
    color: #fff;
    font-weight: bold;
  }
}

.player-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.stat {
  font-size: 14px;
  color: #fff;

  .stat-icon {
    margin-right: 4px;
  }
}

.combat-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
