import createDebug from 'debug'

export function createDebugger(namespace: `weapp-vite:${string}`) {
  const debug = createDebug(namespace)
  if (debug.enabled) {
    return debug
  }
}
