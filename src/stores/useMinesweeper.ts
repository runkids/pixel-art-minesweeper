import { MINIMUM_BOARD_SIZE, MINIMUM_MINE_COUNT } from '@/constants'

import { defineStore } from 'pinia'

export interface Square {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

/**
 * The delta of the square neighbors
 */
const deltas = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

export const useMinesweeper = defineStore('minesweeper', () => {
  const boardSize = ref(0)
  const mineCount = ref(0)
  const flags = ref(0)
  const squares = ref<Square[]>([])

  const latestClickIndex = ref(-1)

  const isStarted = ref(false)
  const isGameOver = ref(false)
  const isVictory = ref(false)

  /**
   * Track the square neighbors and call the callback function when the condition is met
   * @param targetIndex
   * @param condition
   * @param callback
   */
  const traverseSquareNeighbors = (
    targetIndex: number,
    condition: (neighborIdx: number) => boolean,
    callback: (neighborIdx: number) => void
  ) => {
    const size = boardSize.value
    const currRow = Math.floor(targetIndex / size)
    const currCol = targetIndex % size
    for (const [dx, dy] of deltas) {
      const newRow = currRow + dx
      const newCol = currCol + dy
      const newIndex = newRow * size + newCol

      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && condition(newIndex)) {
        callback(newIndex)
      }
    }
  }

  /**
   * initial mines place and ensure first click is not a mine
   * @param firstIndex
   */
  const placeMines = (firstIndex: number): Promise<Square[]> => {
    return new Promise((resolve) => {
      let minesToPlace = mineCount.value
      while (minesToPlace > 0) {
        const index = Math.floor(Math.random() * squares.value.length)
        const square = squares.value[index]
        if (firstIndex !== index && !square.isMine) {
          square.isMine = true
          minesToPlace--
        }
      }
      calculateAdjacentMines()
      resolve(squares.value)
    })
  }

  // Calculate adjacent mines
  const calculateAdjacentMines = () => {
    squares.value.forEach((square, idx) => {
      if (!square.isMine) {
        let count = 0

        traverseSquareNeighbors(
          idx,
          (neighborIdx) => squares.value[neighborIdx].isMine,
          () => {
            count++
          }
        )

        square.adjacentMines = count
      }
    })
  }

  const clickSquare = async (index: number) => {
    if (isGameOver.value) return
    if (!isStarted.value) {
      isStarted.value = true
      await placeMines(index)
    }

    const square = squares.value[index]

    if (square.isMine) {
      square.isRevealed = true
      isGameOver.value = true
      latestClickIndex.value = index
    } else {
      if (square.adjacentMines > 0) {
        square.isRevealed = true
        checkIsVictory()
      } else {
        clearAdjacentSquares(index)
      }
    }
  }

  const clearAdjacentSquares = (index: number) => {
    const queue: number[] = [index]

    while (queue.length > 0) {
      const currentIdx = queue.shift()!
      const square = squares.value[currentIdx]

      if (!square.isRevealed) {
        square.isRevealed = true

        if (square.isFlagged) {
          square.isFlagged = false
        }

        if (square.adjacentMines === 0) {
          traverseSquareNeighbors(
            currentIdx,
            (neighborIdx) => !squares.value[neighborIdx].isRevealed,
            (neighborIdx) => {
              queue.push(neighborIdx)
            }
          )
        }
      }
    }

    checkIsVictory()
  }

  const rightClickSquare = (index: number) => {
    if (isGameOver.value || isVictory.value || squares.value[index].isRevealed) return
    if (!squares.value[index].isFlagged && flags.value === 0) {
      return
    }
    const square = squares.value[index]
    square.isFlagged = !square.isFlagged
    if (square.isFlagged) {
      flags.value--
    } else {
      flags.value++
    }
    checkIsVictory()
  }

  const doubleClickSquare = (index: number) => {
    if (isGameOver.value || isVictory.value) return

    const square = squares.value[index]
    if (!square.isRevealed || square.adjacentMines === 0) {
      return
    }

    let flaggedCount = 0

    traverseSquareNeighbors(
      index,
      (neighborIdx) => squares.value[neighborIdx].isFlagged,
      () => {
        flaggedCount++
      }
    )

    if (flaggedCount === square.adjacentMines) {
      traverseSquareNeighbors(
        index,
        (neighborIdx) => !squares.value[neighborIdx].isRevealed && !squares.value[neighborIdx].isFlagged,
        (neighborIdx) => {
          clickSquare(neighborIdx)
        }
      )
    }
  }

  const showAllMines = () => {
    squares.value.forEach((square) => {
      if (square.isMine && !square.isRevealed) {
        square.isRevealed = true
      }
    })
  }

  const flagAllMines = () => {
    squares.value.forEach((square) => {
      if (square.isMine && !square.isFlagged) {
        square.isFlagged = true
      }
    })
    flags.value = 0
  }

  /**
   * Restart game
   * @param config
   */
  const restart = (config?: { boardSize: number; mineCount: number }) => {
    // reset game state
    latestClickIndex.value = -1
    isGameOver.value = false
    isStarted.value = false
    isVictory.value = false

    // reset board
    boardSize.value = config?.boardSize ?? MINIMUM_BOARD_SIZE
    const totalSquares = Math.pow(boardSize.value, 2)
    mineCount.value = config?.mineCount ?? MINIMUM_MINE_COUNT
    flags.value = mineCount.value

    // reset squares
    squares.value = Array.from({ length: totalSquares }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  }

  const checkIsVictory = () => {
    isVictory.value = !squares.value.some((square) => !square.isMine && !square.isRevealed)
  }

  /**
   * Restore previous step by latestClickIndex
   */
  const restorePreviousStep = () => {
    isGameOver.value = false
    if (latestClickIndex.value === -1) return
    squares.value[latestClickIndex.value].isRevealed = false
    latestClickIndex.value = -1
  }

  const setIsGameOver = () => {
    isGameOver.value = true
  }

  // Created
  restart({ boardSize: MINIMUM_BOARD_SIZE, mineCount: MINIMUM_MINE_COUNT })

  return {
    boardSize: readonly(boardSize),
    squares: readonly(squares),
    isGameOver: readonly(isGameOver),
    isVictory: readonly(isVictory),
    isStarted: readonly(isStarted),
    latestClickIndex,
    flags,
    restart,
    clickSquare,
    calculateAdjacentMines,
    clearAdjacentSquares,
    rightClickSquare,
    doubleClickSquare,
    restorePreviousStep,
    showAllMines,
    flagAllMines,
    setIsGameOver,
  }
})

export const minesweeperStoreToRefs = () => toRefs(useMinesweeper())
