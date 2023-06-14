import { CharacterItems, characterStoreToRefs, useCharacter } from '@/stores/useCharacter'
import { MINIMUM_BOARD_SIZE, MINIMUM_MINE_COUNT } from '@/constants'
import { minesweeperStoreToRefs, useMinesweeper } from '@/stores/useMinesweeper'

import { randomNumber } from '@/utils/index'

interface Listeners {
  onGameStarted?: () => void
  onGameOver?: (items: CharacterItems) => void
  onGameRankCompleted?: () => void
  onGameRestart?: () => void
}

export function useGameController(listeners?: Listeners) {
  const character = useCharacter()
  const { items, rank, hp } = characterStoreToRefs()

  const minesweeper = useMinesweeper()
  const { isGameOver, isVictory, isStarted } = minesweeperStoreToRefs()

  // Character Watcher
  watch(hp, () => {
    if (hp.value === 0) {
      minesweeper.setIsGameOver()
    }
  })

  // Minesweeper Watcher
  watch(isStarted, (started) => {
    if (started) {
      listeners?.onGameStarted?.()
    }
  })

  watch(isGameOver, (gameOver) => {
    if (!gameOver) return
    character.stopBleed()
    if (items.value.superStar === 0) {
      character.updateHp(0)
      minesweeper.showAllMines()
    }
    listeners?.onGameOver?.(items.value)
  })

  watch(isVictory, (victory) => {
    if (victory) {
      minesweeper.flagAllMines()
      character.stopBleed()
      listeners?.onGameRankCompleted?.()
    }
  })

  const createBoard = () => {
    const MAXIMUM_BOARD_SIZE = Math.min(MINIMUM_BOARD_SIZE + rank.value - 1, 16)
    const boardSize = MAXIMUM_BOARD_SIZE

    const rankRankLimit = Math.floor(rank.value / 5)
    const ratio = randomNumber(rankRankLimit, rankRankLimit + rankRankLimit > 1 ? hp.value : 0)
    const MAXIMUM_MINE_COUNT = Math.floor(Math.pow(boardSize, 2) / 6) + ratio
    const mineCount = randomNumber(MINIMUM_MINE_COUNT, MAXIMUM_MINE_COUNT)

    minesweeper.restart({ boardSize, mineCount })
  }

  const restartGame = () => {
    character.reset()
    createBoard()
    listeners?.onGameRestart?.()
  }

  const startNextRank = () => {
    rank.value += 1
    createBoard()
    character.updateHp(hp.value + 1)
  }

  const consumeSuperStar = () => {
    minesweeper.restorePreviousStep()
    character.updatedItems((items) => {
      items.superStar -= 1
      return items
    })
    character.updateHp()
  }

  return {
    restartGame,
    startNextRank,
    consumeSuperStar,
    showAllMines: minesweeper.showAllMines,
    startBleed: character.startBleed,
  }
}
