import type { MaybePromise } from './types'

export async function invokeMaybePromise<T>(handler?: () => MaybePromise<T>) {
  if (!handler) {
    return
  }
  await handler()
}
