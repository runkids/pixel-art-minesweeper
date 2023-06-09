interface Options {
  onTimeUp?: () => void
  onCountdown?: (counter: number) => void
}

export function useCountdown(seconds: number, { onTimeUp, onCountdown }: Options) {
  let timer: number | undefined
  const counter = ref(seconds)

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
    if (clearTime) counter.value = seconds
    if (timer) clearInterval(timer)
  }

  return {
    counter,
    start,
    stop,
  }
}
