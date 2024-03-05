import _createDebug from 'debug'

const _debug = _createDebug('weapp-tw')

function createDebug(prefix?: string) {
  function debug(formatter: any, ...args: any[]) {
    return _debug((prefix ?? '') + formatter, ...args)
  }

  return debug
}

export { createDebug }
