/**
 * get random number between minimum and maximum
 * @param minimum number
 * @param maximum number
 */
export const randomNumber = (minimum: number, maximum: number) => {
  const value = Math.floor(Math.random() * minimum) + minimum
  if (value < minimum) {
    return minimum
  } else if (value > maximum) {
    return maximum
  } else {
    return value
  }
}

/**
 * init time range by rank
 * @param rank number
 */
export const initTimeRange = (rank = 1) => {
  const ratio = Math.floor(rank / 5) + 1
  return randomNumber(ratio * 50, ratio * 150)
}
