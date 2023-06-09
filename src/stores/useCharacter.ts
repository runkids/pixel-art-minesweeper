import { HP, SUPER_STAR_LIMIT } from '@/constants'

import { defineStore } from 'pinia'
import { useCountdown } from '@/composable/useCountdown'

interface Items {
  timeMachine: number
  superStar: number
}

export const useCharacter = defineStore('character', () => {
  const hp = ref(HP)
  const rank = ref(1)
  const items = ref<Items>({ timeMachine: 1, superStar: SUPER_STAR_LIMIT })

  const { start, stop } = useCountdown(HP * 10, {
    onCountdown: (counter) => {
      // Every 10 seconds, the character will lose 1 HP
      if (counter % 10 === 0) {
        hp.value--
      }
    },
  })

  const startBleed = () => {
    start()
  }

  const updateHp = (value: number = HP) => {
    hp.value = hp.value + value >= HP ? HP : value
  }

  watch(hp, () => {
    if (hp.value === 0) {
      stop()
    }
  })

  const updatedItems = (cb: (items: Items) => Items) => {
    const newItems = cb(Object.assign({}, items.value))
    items.value = newItems
  }

  return {
    hp: readonly(hp),
    items: readonly(items),
    rank,
    startBleed,
    stopBleed: stop,
    updateHp,
    updatedItems,
  }
})
