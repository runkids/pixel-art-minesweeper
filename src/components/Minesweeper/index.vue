<script setup lang="ts">
import { useMinesweeper, Cell } from '@/stores/useMinesweeper.js'
import { useCharacter } from '@/stores/useCharacter'
import { SUPER_STAR_LIMIT } from '@/constants'

defineProps({
  countdown: Number,
})

const emits = defineEmits(['stop-countdown', 'start-countdown', 'reset-countdown'])

const character = useCharacter()
const { rank } = toRefs(character)

const minesweeper = useMinesweeper()
const { boardSize, cells, isVictory, isGameOver, isStarted } = toRefs(minesweeper)

const showMine = (cell: Cell) => cell.isMine && cell.isRevealed

const handleClick = (idx: number) => {
  const cell = cells.value[idx]
  if (!cell.isFlagged) {
    minesweeper.clickSquare(idx)
  }
}

const handleRightClick = (idx: number) => {
  minesweeper.rightClickSquare(idx)
}

const handleDoubleClick = (idx: number) => {
  minesweeper.doubleClickSquare(idx)
}

const restartGame = () => {
  minesweeper.restart()
  rank.value = 1
  character.updateHp()
  character.updatedItems((items) => {
    items.superStar = SUPER_STAR_LIMIT
    return items
  })

  emits('stop-countdown')
  emits('reset-countdown')
}

watch(isStarted, (started) => {
  if (started) {
    emits('start-countdown')
  }
})

watch([isGameOver, isVictory], ([gameOver, victory]) => {
  if (gameOver && character.items.superStar === 0) {
    character.updateHp(0)
    minesweeper.showAllMines()
  }

  if (gameOver || victory) {
    emits('stop-countdown', false)
    character.stopBleed()
  }
})
</script>

<script lang="ts">
export default {
  name: 'main-minesweeper',
}
</script>

<template>
  <div class="box-border inline-flex flex-col items-center p-10">
    <div class="nes-container is-rounded is-dark is-centered inline-block">
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
    <button v-if="!isStarted && rank === 1" class="nes-btn is-warning mt-10" @click="restartGame">REFRESH</button>
    <button v-if="isGameOver" class="nes-btn is-warning mt-10" @click="restartGame">RESTART</button>
    <slot />
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
