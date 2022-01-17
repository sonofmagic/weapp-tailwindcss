export const foo = 'bar'

export const wait = (timeout?: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, timeout)
  })
}
