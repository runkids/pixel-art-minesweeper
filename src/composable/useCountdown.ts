interface Options {
  onTimeUp?: () => void
  onCountdown?: (counter: number) => void
}

export function useCountdown(initSeconds: number, { onTimeUp, onCountdown }: Options) {
  let timer: number | undefined
  const counter = ref(initSeconds)

  const start = () => {
    timer = setInterval(() => {
      if (counter.value === 0) {
        clearInterval(timer)
        onTimeUp?.()
        return
      }
      onCountdown?.(counter.value)
      counter.value--
    }, 1000)
  }

  const stop = (clearTime = true) => {
    if (clearTime) counter.value = initSeconds
    if (timer) clearInterval(timer)
  }

  const reset = (seconds: number) => {
    stop(true)
    counter.value = seconds ?? initSeconds
  }

  onUnmounted(stop)

  return {
    counter,
    start,
    stop,
    reset,
  }
}
