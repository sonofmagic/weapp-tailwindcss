import _createDebug from 'debug'

const _debug = _createDebug('weapp-tw')

type DebugFunction = ((formatter: any, ...args: any[]) => void) & {
  readonly enabled: boolean
}

function createDebug(prefix?: string) {
  const debug = ((formatter: any, ...args: any[]) => {
    return _debug((prefix ?? '') + formatter, ...args)
  }) as DebugFunction

  Object.defineProperty(debug, 'enabled', {
    enumerable: false,
    configurable: false,
    get() {
      return _debug.enabled
    },
  })

  return debug
}

export { createDebug }
