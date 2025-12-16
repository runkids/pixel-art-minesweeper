<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMinesweeper, Square, minesweeperStoreToRefs } from '@/stores/useMinesweeper'
import { dungeonStoreToRefs } from '@/stores/useDungeon'

const emit = defineEmits<{
  (e: 'mineClicked', index: number, position: { x: number; y: number }): void
  (e: 'victory', position: { x: number; y: number }): void
  (e: 'cellRevealed', index: number): void
  (e: 'treasureFound', index: number, position: { x: number; y: number }): void
}>()

const minesweeper = useMinesweeper()
const { boardSize, squares, isGameOver, isVictory } = minesweeperStoreToRefs()

const { minesRevealed } = dungeonStoreToRefs()

// Track revealed cells for animation
const recentlyRevealed = ref<Set<number>>(new Set())
const animatingCells = ref<Set<number>>(new Set())

// Skill mode state
const skillMode = ref<'none' | 'scan' | 'bomb'>('none')

// Board container ref for position calculations
const boardRef = ref<HTMLElement | null>(null)

// Get cell position for animations
const getCellPosition = (index: number): { x: number; y: number } => {
  if (!boardRef.value) return { x: 0, y: 0 }
  const cells = boardRef.value.querySelectorAll('.square')
  const cell = cells[index] as HTMLElement
  if (!cell) return { x: 0, y: 0 }
  const rect = cell.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

const showMine = (square: Square) => square.isMine && square.isRevealed

// Show mine preview when reveal skill is active
const showMinePreview = (square: Square) => {
  return minesRevealed.value && square.isMine && !square.isRevealed
}

// Random treasure spawn (5% chance on safe reveal)
const treasureSquares = ref<Set<number>>(new Set())

const initTreasures = () => {
  treasureSquares.value.clear()
  const totalSquares = squares.value.length
  const treasureCount = Math.max(1, Math.floor(totalSquares * 0.03)) // 3% of squares
  const safeSquares = squares.value
    .map((s, i) => ({ square: s, index: i }))
    .filter(({ square }) => !square.isMine)

  for (let i = 0; i < treasureCount && safeSquares.length > 0; i++) {
    const randomIdx = Math.floor(Math.random() * safeSquares.length)
    treasureSquares.value.add(safeSquares[randomIdx].index)
    safeSquares.splice(randomIdx, 1)
  }
}

// Check if cell has treasure
const hasTreasure = (index: number) => {
  return treasureSquares.value.has(index) && squares.value[index].isRevealed
}

const handleClick = (idx: number) => {
  const square = squares.value[idx]

  // Handle skill modes
  if (skillMode.value === 'scan') {
    // Scan skill - reveal if safe or mark as dangerous
    skillMode.value = 'none'
    emit('cellRevealed', idx)
    return
  }

  if (skillMode.value === 'bomb') {
    // Bomb skill - reveal 3x3 area safely (skip mines)
    skillMode.value = 'none'
    revealArea(idx, 3)
    return
  }

  if (!square.isFlagged) {
    // Check if this is a mine
    if (!minesweeper.isStarted) {
      // First click - initialize treasures after mines are placed
      minesweeper.clickSquare(idx).then(() => {
        initTreasures()
      })
      return
    }

    const wasMine = square.isMine

    // Track cells before click for animation
    const revealedBefore = new Set(
      squares.value
        .map((s, i) => (s.isRevealed ? i : -1))
        .filter((i) => i >= 0)
    )

    minesweeper.clickSquare(idx)

    if (wasMine && square.isRevealed) {
      // Mine clicked!
      const pos = getCellPosition(idx)
      emit('mineClicked', idx, pos)
    } else {
      // Find newly revealed cells for animation
      const newlyRevealed = squares.value
        .map((s, i) => (s.isRevealed && !revealedBefore.has(i) ? i : -1))
        .filter((i) => i >= 0)

      // Animate newly revealed cells
      newlyRevealed.forEach((cellIdx, delay) => {
        setTimeout(() => {
          recentlyRevealed.value.add(cellIdx)
          animatingCells.value.add(cellIdx)

          // Check for treasure
          if (treasureSquares.value.has(cellIdx)) {
            const pos = getCellPosition(cellIdx)
            emit('treasureFound', cellIdx, pos)
          }

          setTimeout(() => {
            recentlyRevealed.value.delete(cellIdx)
            animatingCells.value.delete(cellIdx)
          }, 300)
        }, delay * 30)
      })
    }
  }
}

// Reveal area safely (for bomb skill)
const revealArea = (centerIdx: number, size: number) => {
  const row = Math.floor(centerIdx / boardSize.value)
  const col = centerIdx % boardSize.value
  const halfSize = Math.floor(size / 2)

  for (let dr = -halfSize; dr <= halfSize; dr++) {
    for (let dc = -halfSize; dc <= halfSize; dc++) {
      const newRow = row + dr
      const newCol = col + dc
      if (
        newRow >= 0 &&
        newRow < boardSize.value &&
        newCol >= 0 &&
        newCol < boardSize.value
      ) {
        const idx = newRow * boardSize.value + newCol
        const square = squares.value[idx]
        // Only reveal non-mine squares
        if (!square.isMine && !square.isRevealed && !square.isFlagged) {
          minesweeper.clickSquare(idx)
        }
      }
    }
  }
}

const handleRightClick = (idx: number) => {
  minesweeper.rightClickSquare(idx)
}

const handleDoubleClick = (idx: number) => {
  minesweeper.doubleClickSquare(idx)
}

// Watch for victory
watch(isVictory, (victory) => {
  if (victory && boardRef.value) {
    const rect = boardRef.value.getBoundingClientRect()
    emit('victory', {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }
})

// Get number color class
const getNumberColorClass = (num: number) => {
  const colors: Record<number, string> = {
    1: 'text-blue-400',
    2: 'text-green-400',
    3: 'text-red-400',
    4: 'text-purple-400',
    5: 'text-yellow-400',
    6: 'text-cyan-400',
    7: 'text-pink-400',
    8: 'text-gray-400',
  }
  return colors[num] || ''
}

// Expose skill mode setter
const setSkillMode = (mode: 'none' | 'scan' | 'bomb') => {
  skillMode.value = mode
}

defineExpose({
  setSkillMode,
  getCellPosition,
})
</script>

<script lang="ts">
export default {
  name: 'main-minesweeper',
}
</script>

<template>
  <div class="nes-container is-rounded is-dark is-centered inline-block">
    <div ref="boardRef" class="board" :class="{ 'skill-mode': skillMode !== 'none' }">
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
            'is-primary opacity-70': square.isRevealed && !square.adjacentMines && !hasTreasure(index),
            'is-flagged': square.isFlagged,
            'is-treasure': hasTreasure(index),
            'mine-preview': showMinePreview(square),
            'reveal-animation': animatingCells.has(index),
            'skill-target': skillMode !== 'none' && !square.isRevealed,
          },
          getNumberColorClass(square.adjacentMines),
        ]"
        @click="handleClick(index)"
        @contextmenu.prevent="handleRightClick(index)"
        @dblclick="handleDoubleClick(index)"
      >
        <Twemoji v-if="showMine(square)" emoji="mine" />
        <span v-else-if="showMinePreview(square)" class="mine-hint">💣</span>
        <Twemoji v-else-if="hasTreasure(index)" emoji="chest" />
        <template v-else>
          <Twemoji v-if="square.isFlagged" emoji="flag" />
          <span v-else class="number-display">
            {{ square.isRevealed && !square.isMine && square.adjacentMines > 0 ? square.adjacentMines : '' }}
          </span>
        </template>
      </button>
    </div>

    <!-- Skill mode indicator -->
    <div v-if="skillMode !== 'none'" class="skill-indicator">
      <span v-if="skillMode === 'scan'">🔍 Select a cell to scan</span>
      <span v-else-if="skillMode === 'bomb'">💣 Select bomb center point</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.board {
  @apply grid gap-[2px];
  grid-template-columns: repeat(v-bind(boardSize), 1fr);

  &.skill-mode {
    .square:not(.is-primary):not(.is-error):not(.is-disabled) {
      cursor: crosshair;
    }
  }
}

.square {
  @apply box-border w-10 h-10;
  @apply flex items-center justify-center;
  @apply text-xl;
  transition: transform 0.1s, background-color 0.2s;

  &.is-flagged {
    @apply bg-yellow-200;
  }

  &.is-treasure {
    @apply bg-yellow-400;
    animation: treasure-glow 1s infinite alternate;
  }

  &.is-primary.opacity-70::after {
    box-shadow: inset 4px 4px #006bb3;
  }

  &.mine-preview {
    animation: mine-pulse 0.5s infinite;
  }

  &.reveal-animation {
    animation: reveal-pop 0.3s ease-out;
  }

  &.skill-target:hover {
    @apply bg-blue-300;
    transform: scale(1.05);
  }

  .number-display {
    font-weight: bold;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
  }

  .mine-hint {
    opacity: 0.6;
    animation: mine-hint-pulse 0.3s infinite alternate;
  }
}

@keyframes treasure-glow {
  from {
    box-shadow: 0 0 5px #ffd700, inset 0 0 5px #ffd700;
  }
  to {
    box-shadow: 0 0 15px #ffd700, inset 0 0 10px #ffd700;
  }
}

@keyframes mine-pulse {
  0%, 100% {
    background-color: rgba(255, 0, 0, 0.2);
  }
  50% {
    background-color: rgba(255, 0, 0, 0.4);
  }
}

@keyframes reveal-pop {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes mine-hint-pulse {
  from { opacity: 0.4; }
  to { opacity: 0.8; }
}

.skill-indicator {
  @apply mt-4 text-center text-yellow-400 text-sm;
  animation: indicator-pulse 1s infinite;
}

@keyframes indicator-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

// Number colors
.text-blue-400 .number-display { color: #60a5fa; }
.text-green-400 .number-display { color: #4ade80; }
.text-red-400 .number-display { color: #f87171; }
.text-purple-400 .number-display { color: #c084fc; }
.text-yellow-400 .number-display { color: #facc15; }
.text-cyan-400 .number-display { color: #22d3ee; }
.text-pink-400 .number-display { color: #f472b6; }
.text-gray-400 .number-display { color: #9ca3af; }
</style>
