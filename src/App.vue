<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useCountdown } from '@/composable/useCountdown'
import { initTimeRange } from '@/utils/index'
import { useGameController } from '@/composable/useGameController'
import { useGameStatus } from '@/composable/useGameStatus'
import { usePixelAnimation } from '@/composable/usePixelAnimation'
import { useDungeon, dungeonStoreToRefs, type Skill, type Treasure } from '@/stores/useDungeon'
import { useCharacter, characterStoreToRefs } from '@/stores/useCharacter'
import { useMinesweeper } from '@/stores/useMinesweeper'

// Refs for components
const minesweeperRef = ref<InstanceType<typeof import('./components/Minesweeper/index.vue').default> | null>(null)

// Dialog states
const showSuperStartDialog = ref(false)
const showNextBtn = ref(false)
const showCombatDialog = ref(false)
const showTreasureDialog = ref(false)
const currentTreasure = ref<Treasure | null>(null)

// Animation system
const {
  particles,
  effects,
  isShaking,
  shakeIntensity,
  createExplosion,
  createSparkle,
  createVictoryCelebration,
  createTreasureEffect,
  createDamageEffect,
  createHealEffect,
  createLevelUpEffect,
  updateParticles,
  cleanupEffects,
  clearAll,
} = usePixelAnimation()

// Stores
const dungeon = useDungeon()
const { floor, hasShield } = dungeonStoreToRefs()

const character = useCharacter()
const { hp } = characterStoreToRefs()

const minesweeper = useMinesweeper()

// Animation loop
let animationFrame: number | null = null
const animateParticles = () => {
  updateParticles()
  cleanupEffects()
  if (particles.value.length > 0 || effects.value.length > 0) {
    animationFrame = requestAnimationFrame(animateParticles)
  }
}

const startAnimationLoop = () => {
  if (!animationFrame) {
    animationFrame = requestAnimationFrame(animateParticles)
  }
}

// Countdown and game flow
const {
  counter: countdown,
  start: startCountdown,
  stop: stopCountdown,
  reset: resetCountdown,
} = useCountdown(initTimeRange(), {
  onTimeUp: () => startBleed(),
})

provide(
  'countdown',
  computed(() => countdown.value)
)
const { status } = useGameStatus()

const { restartGame, startNextRank, consumeSuperStar, showAllMines, startBleed } = useGameController({
  onGameStarted: () => {
    startCountdown()
  },
  onGameRankCompleted: () => {
    showNextBtn.value = true
    stopCountdown()

    // Victory celebration animation
    createVictoryCelebration(window.innerWidth / 2, window.innerHeight / 2)
    startAnimationLoop()

    // Advance dungeon floor
    dungeon.nextFloor()
  },
  onGameOver: (items) => {
    stopCountdown()
    if (items.superStar > 0) {
      setTimeout(() => {
        showSuperStartDialog.value = true
      }, 1000)
    }
  },
  onGameRestart: () => {
    resetCountdown(initTimeRange(status.value.rank))
    dungeon.reset()
    clearAll()
  },
})

const actionBtnText = computed(() => {
  if (!status.value.isStarted && status.value.rank === 1) {
    return 'REFRESH'
  } else if (status.value.isGameOver) {
    return 'RESTART'
  } else if (showNextBtn.value) {
    return 'TO NEXT RANK'
  }
  return ''
})

const handleActionBtnClick = () => {
  if (status.value.isGameOver || (!status.value.isStarted && status.value.rank === 1)) {
    restartGame()
  } else if (showNextBtn.value) {
    handleStartNextRank()
  }
}

const handleUseSuperStar = () => {
  consumeSuperStar()
  startCountdown()
  // Heal effect
  createHealEffect(window.innerWidth / 2, window.innerHeight / 2)
  startAnimationLoop()
}

const handleStartNextRank = () => {
  showNextBtn.value = false
  resetCountdown(initTimeRange(status.value.rank))
  startNextRank()

  // Level up effect
  createLevelUpEffect(window.innerWidth / 2, window.innerHeight / 3)
  startAnimationLoop()
}

// Handle mine click - trigger combat or explosion
const handleMineClicked = (_index: number, position: { x: number; y: number }) => {
  // Check if shield is active
  if (hasShield.value) {
    // Shield blocks the mine!
    dungeon.activateShield() // This will turn it off
    createSparkle(position.x, position.y, 15)
    startAnimationLoop()

    // Restore the cell (undo the reveal)
    minesweeper.restorePreviousStep()
    return
  }

  // Create explosion effect
  createExplosion(position.x, position.y, 15)
  startAnimationLoop()

  // Start combat with a monster instead of instant game over
  if (floor.value > 1 || Math.random() > 0.5) {
    // Generate monster and start combat
    const monster = dungeon.generateMonster()
    dungeon.startCombat(monster)
    showCombatDialog.value = true
  }
  // Otherwise, let the normal game over happen
}

// Handle treasure found
const handleTreasureFound = (_index: number, position: { x: number; y: number }) => {
  // Create treasure sparkle effect
  createTreasureEffect(position.x, position.y)
  startAnimationLoop()

  // Generate and show treasure
  currentTreasure.value = dungeon.generateTreasure()
  showTreasureDialog.value = true
}

// Handle treasure collection
const handleCollectTreasure = () => {
  if (currentTreasure.value) {
    dungeon.collectTreasure(currentTreasure.value)

    // If it's a potion, apply healing effect
    if (currentTreasure.value.type === 'potion') {
      const healAmount = currentTreasure.value.value
      character.updateHp(healAmount)
      createHealEffect(window.innerWidth / 2, window.innerHeight / 2)
      startAnimationLoop()
    }

    currentTreasure.value = null
  }
}

// Handle victory in combat
const handleCombatVictory = (_rewards: { exp: number; gold: number }) => {
  // Restore the mine click (undo game over)
  minesweeper.restorePreviousStep()

  // Create victory sparkles
  createSparkle(window.innerWidth / 2, window.innerHeight / 2, 20)
  startAnimationLoop()
}

// Handle defeat in combat
const handleCombatDefeat = () => {
  // Game over - show all mines
  showAllMines()
}

// Handle flee from combat
const handleCombatFlee = () => {
  // Restore the cell, but take some damage
  minesweeper.restorePreviousStep()
}

// Handle player damage in combat
const handlePlayerDamaged = (damage: number) => {
  // Reduce HP
  const newHp = Math.max(0, hp.value - damage)
  character.updateHp(newHp - hp.value) // Pass the delta

  // Damage effect
  createDamageEffect(window.innerWidth / 2, window.innerHeight / 2)
  startAnimationLoop()
}

// Handle skill use
const handleUseSkill = (skill: Skill) => {
  if (!dungeon.useSkill(skill.id)) return

  switch (skill.effect) {
    case 'scan':
      // Set scan mode on minesweeper
      minesweeperRef.value?.setSkillMode('scan')
      break

    case 'shield':
      dungeon.activateShield()
      createSparkle(window.innerWidth / 2, window.innerHeight / 2, 12)
      startAnimationLoop()
      break

    case 'bomb':
      // Set bomb mode on minesweeper
      minesweeperRef.value?.setSkillMode('bomb')
      break

    case 'heal':
      character.updateHp(2)
      createHealEffect(window.innerWidth / 2, window.innerHeight / 2)
      startAnimationLoop()
      break

    case 'reveal':
      dungeon.revealMinesTemporarily(3000)
      break
  }
}

// Handle victory celebration
const handleVictory = (position: { x: number; y: number }) => {
  createVictoryCelebration(position.x, position.y)
  startAnimationLoop()
}

// Cleanup on unmount
onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <main :class="{ 'screen-shake': isShaking }" :style="{ '--shake-intensity': `${shakeIntensity}px` }">
    <header>
      <TopBar />
    </header>
    <section>
      <div class="box-border inline-flex flex-col items-center gap-y-6 p-20">
        <!-- Skills Panel -->
        <SkillsPanel @use-skill="handleUseSkill" />

        <!-- Game Board -->
        <Minesweeper
          ref="minesweeperRef"
          @mine-clicked="handleMineClicked"
          @victory="handleVictory"
          @treasure-found="handleTreasureFound"
        />

        <!-- Action Button -->
        <button v-if="actionBtnText" class="nes-btn is-warning" @click="handleActionBtnClick">
          {{ actionBtnText }}
        </button>
      </div>
    </section>

    <!-- Particle Canvas -->
    <canvas
      class="particle-canvas"
      :class="{ 'shake': isShaking }"
    />

    <!-- Particle rendering -->
    <div class="particles-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          backgroundColor: particle.color,
          opacity: particle.life / particle.maxLife,
        }"
      />
    </div>

    <!-- Effect overlays -->
    <div v-for="effect in effects" :key="effect.id" class="effect-container">
      <div
        v-if="effect.type === 'explosion'"
        class="explosion-effect"
        :style="{ left: `${effect.x}px`, top: `${effect.y}px` }"
      />
      <div
        v-if="effect.type === 'victory'"
        class="victory-overlay"
      />
      <div
        v-if="effect.type === 'damage'"
        class="damage-overlay"
      />
    </div>
  </main>

  <!-- Super Star Dialog -->
  <Dialog
    v-model="showSuperStartDialog"
    confirmText="Confirm"
    cancelText="Cancel"
    @confirm="handleUseSuperStar"
    @close="showAllMines"
  >
    <DialogUseSuperStarContent />
  </Dialog>

  <!-- Combat Dialog -->
  <CombatDialog
    v-model="showCombatDialog"
    @victory="handleCombatVictory"
    @defeat="handleCombatDefeat"
    @flee="handleCombatFlee"
    @player-damaged="handlePlayerDamaged"
  />

  <!-- Treasure Dialog -->
  <TreasureDialog
    v-model="showTreasureDialog"
    :treasure="currentTreasure"
    @collect="handleCollectTreasure"
  />
</template>

<style lang="scss" scoped>
main {
  @apply w-full h-full min-h-screen overflow-y-auto;
  @apply bg-[#212529];
  position: relative;

  &.screen-shake {
    animation: screen-shake 0.15s linear;
  }
}

@keyframes screen-shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(var(--shake-intensity), var(--shake-intensity)); }
  50% { transform: translate(calc(var(--shake-intensity) * -1), var(--shake-intensity)); }
  75% { transform: translate(var(--shake-intensity), calc(var(--shake-intensity) * -1)); }
}

header {
  @apply w-full bg-black p-4 box-border;
  @apply fixed top-0 left-0 z-10;
  @apply flex items-center justify-between;
}

section {
  @apply flex justify-center box-border lg:pt-[84px];
}

.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.particle {
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -50%);
  image-rendering: pixelated;
}

.effect-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99;
}

.explosion-effect {
  position: absolute;
  width: 80px;
  height: 80px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgba(255, 200, 0, 0.9) 0%,
    rgba(255, 100, 0, 0.6) 30%,
    rgba(255, 50, 0, 0.3) 60%,
    transparent 70%
  );
  border-radius: 50%;
  animation: explode-animation 0.5s ease-out forwards;
}

@keyframes explode-animation {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

.victory-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 215, 0, 0.2) 50%,
    rgba(255, 215, 0, 0.1) 100%
  );
  animation: victory-flash 0.5s ease-in-out infinite alternate;
}

@keyframes victory-flash {
  0% { opacity: 0.2; }
  100% { opacity: 0.5; }
}

.damage-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 0, 0, 0.3);
  animation: damage-flash 0.3s ease-out forwards;
}

@keyframes damage-flash {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
