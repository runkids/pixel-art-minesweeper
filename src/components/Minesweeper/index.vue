<script setup lang="ts">
import { useMinesweeper, Cell } from '@/composable/useMinesweeper'

const boardSize = ref(5)
const mineCount = ref(1)
const timer = ref(0)
let interval: null | number = null

const { cells, isVictory, isGameOver, isStarted, flags, restart, rightClickSquare, clickSquare, doubleClickSquare } =
  useMinesweeper({
    boardSize,
    mineCount,
  })

const showMine = (cell: Cell) => cell.isMine && cell.isRevealed

const handleClick = (idx: number) => {
  const cell = cells.value[idx]
  if (!cell.isFlagged) {
    clickSquare(idx)
  }
}

const handleRightClick = (idx: number) => {
  rightClickSquare(idx)
}

const handleDoubleClick = (idx: number) => {
  doubleClickSquare(idx)
}

const restartGame = () => {
  restart()
  resetTimer()
}

const resetTimer = (clearTime = true) => {
  if (clearTime) {
    timer.value = 0
  }
  if (interval) {
    clearInterval(interval)
  }
}

watch(isStarted, (started) => {
  if (started) {
    interval = setInterval(() => {
      timer.value++
    }, 1000)
  }
})

watch(isGameOver, (gameOver) => {
  if (gameOver) {
    resetTimer(false)
  }
})

watch(isVictory, (victory) => {
  if (victory) {
    resetTimer(false)
  }
})

onUnmounted(resetTimer)
</script>

<script lang="ts">
export default {
  name: 'mines-weeper',
}
</script>

<template>
  <div class="box-border inline-flex flex-col items-center p-10">
    <h2 v-if="isGameOver" class="text-xl text-red-600 select-none animate-bounce">{{ 'GAME OVER' }}</h2>
    <h2 v-if="isVictory" class="text-xl text-yellow-600 select-none">{{ 'You ARE WIN!' }}</h2>
    <button v-if="isGameOver || isVictory" @click="restartGame">RESTART</button>
    <div class="nes-container with-title is-dark is-centered inline-block">
      <MinesweeperTitle :timer="timer" :flags="flags" />
      <div class="board">
        <button
          type="button"
          v-for="(cell, index) in cells"
          :key="index"
          :class="[
            'cell nes-btn',
            {
              'is-disabled': isGameOver || (cell.isFlagged && !showMine(cell)),
              'is-error': showMine(cell),
              'is-primary': cell.isRevealed && cell.adjacentMines,
              'is-primary opacity-70': cell.isRevealed && !cell.adjacentMines,
              'is-flagged': cell.isFlagged,
            },
          ]"
          @click="handleClick(index)"
          @contextmenu.prevent="handleRightClick(index)"
          @dblclick="handleDoubleClick(index)"
        >
          <Twemoji v-if="showMine(cell)" emoji="mine" />
          <template v-else>
            <Twemoji v-if="cell.isFlagged" emoji="flag" />
            <span v-else>{{ cell.isRevealed && !cell.isMine ? cell.adjacentMines : '' }}</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.board {
  @apply grid gap-[2px];
  grid-template-columns: repeat(v-bind(boardSize), 1fr);
}

.cell {
  @apply box-border w-10 h-10;
  @apply flex items-center justify-center;
  @apply text-xl;
  &.is-flagged {
    @apply bg-yellow-200;
  }
  &.is-primary.opacity-70::after {
    box-shadow: inset 4px 4px #006bb3;
  }
}
</style>
