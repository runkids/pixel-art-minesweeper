<script setup lang="ts">
import { useMinesweeper, Square, minesweeperStoreToRefs } from '@/stores/useMinesweeper'

const minesweeper = useMinesweeper()
const { boardSize, squares, isGameOver } = minesweeperStoreToRefs()

const showMine = (square: Square) => square.isMine && square.isRevealed

const handleClick = (idx: number) => {
  const square = squares.value[idx]
  if (!square.isFlagged) {
    minesweeper.clickSquare(idx)
  }
}

const handleRightClick = (idx: number) => {
  minesweeper.rightClickSquare(idx)
}

const handleDoubleClick = (idx: number) => {
  minesweeper.doubleClickSquare(idx)
}
</script>

<script lang="ts">
export default {
  name: 'main-minesweeper',
}
</script>

<template>
  <div class="nes-container is-rounded is-dark is-centered inline-block">
    <div class="board">
      <button
        type="button"
        v-for="(square, index) in squares"
        :key="index"
        :class="[
          'square nes-btn',
          {
            'is-disabled': isGameOver || (square.isFlagged && !showMine(square)),
            'is-error': showMine(square),
            'is-primary': square.isRevealed && square.adjacentMines,
            'is-primary opacity-70': square.isRevealed && !square.adjacentMines,
            'is-flagged': square.isFlagged,
          },
        ]"
        @click="handleClick(index)"
        @contextmenu.prevent="handleRightClick(index)"
        @dblclick="handleDoubleClick(index)"
      >
        <Twemoji v-if="showMine(square)" emoji="mine" />
        <template v-else>
          <Twemoji v-if="square.isFlagged" emoji="flag" />
          <span v-else>{{ square.isRevealed && !square.isMine ? square.adjacentMines : '' }}</span>
        </template>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.board {
  @apply grid gap-[2px];
  grid-template-columns: repeat(v-bind(boardSize), 1fr);
}
.square {
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
