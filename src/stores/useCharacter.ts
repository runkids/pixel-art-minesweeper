import { HP, SUPER_STAR_LIMIT } from '@/constants'

import { defineStore } from 'pinia'
import { useCountdown } from '@/composable/useCountdown'

export interface CharacterItems {
  timeMachine: number
  superStar: number
}

export const useCharacter = defineStore('character', () => {
  const hp = ref(HP)
  const rank = ref(1)
  const items = ref<CharacterItems>({ timeMachine: 1, superStar: SUPER_STAR_LIMIT })

  const { start: startBleed, stop: stopBleed } = useCountdown(HP * 10, {
    onCountdown: (counter) => {
      // Every 10 seconds, the character will lose 1 HP
      if (counter % 10 === 0) {
        hp.value--
      }
    },
  })

  watch(hp, () => {
    if (hp.value === 0) {
      stopBleed()
    }
  })

  const updateHp = (value: number = HP) => {
    hp.value = hp.value + value >= HP ? HP : value
  }

  const updatedItems = (cb: (items: CharacterItems) => CharacterItems) => {
    const newItems = cb(Object.assign({}, items.value))
    items.value = newItems
  }

  const reset = () => {
    rank.value = 1
    hp.value = HP
    items.value = { timeMachine: 1, superStar: SUPER_STAR_LIMIT }
  }

  return {
    hp: readonly(hp),
    items: readonly(items),
    rank,
    startBleed,
    stopBleed,
    updateHp,
    updatedItems,
    reset,
  }
})

export const characterStoreToRefs = () => toRefs(useCharacter())
