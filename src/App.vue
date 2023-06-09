<script setup lang="ts">
import { useCountdown } from '@/composable/useCountdown'
import { useCharacter } from '@/stores/useCharacter'
import { randomNumber } from '@/utils/index'
import { useMinesweeper } from '@/stores/useMinesweeper'

const showSuperStartDialog = ref(false)
const showNextBtn = ref(false)

const character = useCharacter()
const { items, rank } = toRefs(character)

const minesweeper = useMinesweeper()
const { isGameOver, isVictory } = toRefs(minesweeper)

const {
  counter: countdown,
  start: startCountdown,
  stop: stopCountdown,
} = useCountdown(randomNumber(200, 600), {
  onTimeUp: character.startBleed,
})

watch(isGameOver, () => {
  if (isGameOver.value && items.value.superStar > 0) {
    setTimeout(() => {
      showSuperStartDialog.value = true
    }, 1000)
  }
})

watch(isVictory, () => {
  if (isVictory.value) {
    showNextBtn.value = true
  }
})

const handleConfirmUseSuperStar = () => {
  startCountdown()
  minesweeper.restorePreviousStep()
  character.updatedItems((items) => {
    items.superStar -= 1
    return items
  })
  character.updateHp()
}

const handleConfirmNextRank = () => {
  rank.value += 1
  character.updateHp(character.hp + 1)
  minesweeper.restart()
  character.stopBleed()
  stopCountdown(true)
  showNextBtn.value = false
}

const handleResetTimer = (value = randomNumber(200, 600)) => {
  countdown.value = value
}
</script>

<template>
  <main>
    <header>
      <div class="flex flex-col gap-y-2 w-1/3">
        <Heart :countdown="countdown" />
        <MinesweeperInfo :timer="countdown" />
      </div>
      <div class="flex-1 flex flex-col items-center justify-center">
        <span class="text-white text-xl">Rank:{{ rank }}</span>
        <h2 v-if="isGameOver" class="mt-5 text-xl text-red-600 select-none animate-bounce">{{ 'GAME OVER' }}</h2>
        <h2 v-if="isVictory" class="mt-5 text-xl text-yellow-600 select-none animate-pulse">{{ 'COMPLETE!' }}</h2>
      </div>
      <SuperStars />
      <a
        class="nes-icon github is-medium cursor-pointer ml-4 animate-pulse"
        href="https://github.com/runkids/pixel-art-minesweeper"
        target="_blank"
      />
    </header>
    <section class="flex justify-center">
      <Minesweeper
        :countdown="countdown"
        @stop-countdown="stopCountdown"
        @start-countdown="startCountdown"
        @reset-countdown="handleResetTimer"
      >
        <button v-if="showNextBtn" class="nes-btn is-warning mt-10" @click="handleConfirmNextRank">TO NEXT RANK</button>
      </Minesweeper>
    </section>
  </main>

  <Dialog v-model="showSuperStartDialog" @confirm="handleConfirmUseSuperStar" @close="() => minesweeper.showAllMines()">
    <div class="title text-red-600 mb-5">GAME OVER</div>
    <p>Don't worry! You have <i class="nes-icon star" /> !</p>
    <p>Do you want to use it to restore previous step and full <i class="nes-icon heart" /> ?</p>
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
  @apply box-border pt-[84px];
}
</style>
