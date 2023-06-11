<script setup lang="ts">
import { useCountdown } from '@/composable/useCountdown'
import { randomNumber } from '@/utils/index'
import { useGameController } from '@/composable/useGameController'

const initTime = (rank = 1) => {
  const ratio = Math.floor(rank / 5) + 1
  return randomNumber(ratio * 50, ratio * 150)
}
const showSuperStartDialog = ref(false)
const showNextBtn = ref(false)

const {
  counter: countdown,
  start: startCountdown,
  stop: stopCountdown,
  reset: resetCountdown,
} = useCountdown(initTime(), {
  onTimeUp: () => startBleed(),
})

provide(
  'countdown',
  computed(() => countdown.value)
)

const { status, restartGame, startNextRank, consumeSuperStar, showAllMines, startBleed } = useGameController({
  onGameStarted: () => {
    startCountdown()
  },
  onGameRankCompleted: () => {
    showNextBtn.value = true
    stopCountdown()
  },
  onGameOver: (items) => {
    stopCountdown(false)
    if (items.superStar > 0) {
      setTimeout(() => {
        showSuperStartDialog.value = true
      }, 1000)
    }
  },
  onGameRestart: () => {
    resetCountdown(initTime(status.value.rank))
  },
})

const handleUseSuperStar = () => {
  consumeSuperStar()
  startCountdown()
}

const handleStartNextRank = () => {
  showNextBtn.value = false
  stopCountdown(true)
  startNextRank()
}
</script>

<template>
  <main>
    <header>
      <TopBar />
    </header>
    <section>
      <div class="box-border inline-flex flex-col items-center gap-y-10 p-20">
        <Minesweeper />
        <button v-if="!status.isStarted && status.rank === 1" class="nes-btn is-warning" @click="restartGame">
          REFRESH
        </button>
        <button v-if="status.isGameOver" class="nes-btn is-warning" @click="restartGame">RESTART</button>
        <button v-if="showNextBtn" class="nes-btn is-warning" @click="handleStartNextRank">TO NEXT RANK</button>
      </div>
    </section>
  </main>

  <Dialog v-model="showSuperStartDialog" @confirm="handleUseSuperStar" @close="showAllMines">
    <DialogUseSuperStarContent />
  </Dialog>
</template>

<style lang="scss" scoped>
main {
  @apply w-full h-full min-h-screen overflow-y-auto;
  @apply bg-[#212529];
}

header {
  @apply w-full bg-black p-4 box-border;
  @apply fixed top-0 left-0 z-10;
  @apply flex items-center justify-between;
}

section {
  @apply flex justify-center box-border lg:pt-[84px];
}
</style>
