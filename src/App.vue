<script setup lang="ts">
import { useCountdown } from '@/composable/useCountdown'
import { initTimeRange } from '@/utils/index'
import { useGameController } from '@/composable/useGameController'
import { useGameStatus } from '@/composable/useGameStatus'

const showSuperStartDialog = ref(false)
const showNextBtn = ref(false)

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
}

const handleStartNextRank = () => {
  showNextBtn.value = false
  resetCountdown(initTimeRange(status.value.rank))
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
        <button v-if="actionBtnText" class="nes-btn is-warning" @click="handleActionBtnClick">
          {{ actionBtnText }}
        </button>
      </div>
    </section>
  </main>

  <Dialog v-model="showSuperStartDialog" confirmText="Confirm" cancelText="Cancel" @confirm="handleUseSuperStar" @close="showAllMines">
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
