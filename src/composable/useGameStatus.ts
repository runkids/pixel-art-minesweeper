import { characterStoreToRefs } from '@/stores/useCharacter'
import { minesweeperStoreToRefs } from '@/stores/useMinesweeper'

export function useGameStatus() {
  const { items, rank, hp } = characterStoreToRefs()
  const { isGameOver, isVictory, isStarted, flags } = minesweeperStoreToRefs()

  const status = computed(() => {
    return {
      hp: hp.value,
      rank: rank.value,
      items: items.value,
      flags: flags.value,
      isGameOver: isGameOver.value,
      isStarted: isStarted.value,
      isVictory: isVictory.value,
    }
  })

  return {
    status,
  }
}
