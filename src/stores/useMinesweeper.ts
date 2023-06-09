import { defineStore } from 'pinia'
import { randomNumber } from '@/utils/index'

export interface Cell {
  isMine: boolean // 表示是否為地雷
  isRevealed: boolean // 表示是否已揭開
  isFlagged: boolean // 表示是否被標記旗幟
  adjacentMines: number // 表示相鄰的地雷數量
}

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
  const initBoardSize = randomNumber(8, 16)
  const initMineCount = randomNumber(Math.floor(initBoardSize ** 2 / 6), Math.floor(initBoardSize ** 2 / 4))
  const boardSize = ref(initBoardSize)
  const mineCount = ref(initMineCount)
  const cells = ref<Cell[]>([])
  const isStarted = ref(false)
  const isGameOver = ref(false)
  const isVictory = ref(false)
  const flags = ref(initMineCount)
  const latestClickIndex = ref(-1)

  const traverseCellNeighbors = (
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

  // 放置地雷於棋盤上，並且確保第一次點擊的格子不是地雷
  const placeMines = (firstIndex: number): Promise<Cell[]> => {
    return new Promise((resolve) => {
      let minesToPlace = mineCount.value
      while (minesToPlace > 0) {
        const index = Math.floor(Math.random() * cells.value.length)
        const cell = cells.value[index]
        if (firstIndex !== index && !cell.isMine) {
          cell.isMine = true
          minesToPlace--
        }
      }
      calculateAdjacentMines()
      resolve(cells.value)
    })
  }

  // 計算每個格子周圍的相鄰地雷數量
  const calculateAdjacentMines = () => {
    cells.value.forEach((cell, idx) => {
      if (!cell.isMine) {
        let count = 0

        traverseCellNeighbors(
          idx,
          (neighborIdx) => cells.value[neighborIdx].isMine,
          () => {
            count++
          }
        )

        cell.adjacentMines = count
      }
    })
  }

  // 點擊指定的格子，根據規則進行相應的處理
  const clickSquare = async (index: number) => {
    if (isGameOver.value) return
    if (!isStarted.value) {
      isStarted.value = true
      await placeMines(index)
    }

    const cell = cells.value[index]

    if (cell.isMine) {
      cell.isRevealed = true
      isGameOver.value = true
      latestClickIndex.value = index
    } else {
      if (cell.adjacentMines > 0) {
        cell.isRevealed = true
        checkIsVictory()
      } else {
        clearAdjacentSquares(index)
      }
    }
  }

  // 清除周圍相鄰的空格
  const clearAdjacentSquares = (index: number) => {
    const queue: number[] = [index]

    while (queue.length > 0) {
      const currentIdx = queue.shift()!
      const cell = cells.value[currentIdx]

      if (!cell.isRevealed) {
        cell.isRevealed = true

        if (cell.isFlagged) {
          cell.isFlagged = false
        }

        if (cell.adjacentMines === 0) {
          traverseCellNeighbors(
            currentIdx,
            (neighborIdx) => !cells.value[neighborIdx].isRevealed,
            (neighborIdx) => {
              queue.push(neighborIdx)
            }
          )
        }
      }
    }

    checkIsVictory()
  }

  // 在指定的格子上進行右鍵點擊，標記或取消標記旗幟
  const rightClickSquare = (index: number) => {
    if (isGameOver.value || isVictory.value || cells.value[index].isRevealed) return
    if (!cells.value[index].isFlagged && flags.value === 0) {
      return
    }
    const cell = cells.value[index]
    cell.isFlagged = !cell.isFlagged
    if (cell.isFlagged) {
      flags.value--
    } else {
      flags.value++
    }
    checkIsVictory()
  }

  const doubleClickSquare = (index: number) => {
    if (isGameOver.value || isVictory.value) return
    const cell = cells.value[index]
    if (!cell.isRevealed || cell.adjacentMines === 0) {
      return
    }

    let flaggedCount = 0

    traverseCellNeighbors(
      index,
      (neighborIdx) => cells.value[neighborIdx].isFlagged,
      () => {
        flaggedCount++
      }
    )

    if (flaggedCount === cell.adjacentMines) {
      traverseCellNeighbors(
        index,
        (neighborIdx) => !cells.value[neighborIdx].isRevealed && !cells.value[neighborIdx].isFlagged,
        (neighborIdx) => {
          clickSquare(neighborIdx)
        }
      )
    }
  }

  const showAllMines = () => {
    cells.value.forEach((cell) => {
      if (cell.isMine && !cell.isRevealed) {
        cell.isRevealed = true
      }
    })
  }

  const flagAllMines = () => {
    cells.value.forEach((cell) => {
      if (cell.isMine && !cell.isFlagged) {
        cell.isFlagged = true
      }
    })
    flags.value = 0
  }

  const restart = () => {
    isGameOver.value = false
    isStarted.value = false
    isVictory.value = false
    latestClickIndex.value = -1

    boardSize.value = randomNumber(8, 16)
    const totalCells = Math.pow(boardSize.value, 2)
    mineCount.value = randomNumber(Math.floor(totalCells / 6), Math.floor(totalCells / 4))
    flags.value = mineCount.value

    cells.value = Array.from({ length: totalCells }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  }

  const checkIsVictory = () => {
    isVictory.value = !cells.value.some((cell) => !cell.isMine && !cell.isRevealed)
  }

  const restorePreviousStep = () => {
    isGameOver.value = false
    if (latestClickIndex.value === -1) return
    cells.value[latestClickIndex.value].isRevealed = false
    latestClickIndex.value = -1
  }

  const setIsGameOver = () => {
    isGameOver.value = true
  }

  watch(isVictory, (win) => {
    if (win) {
      flagAllMines()
    }
  })

  restart()

  return {
    boardSize: readonly(boardSize),
    cells: readonly(cells),
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
    setIsGameOver,
  }
})
