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
