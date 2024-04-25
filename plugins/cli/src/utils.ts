import type { Transform } from 'node:stream'
import fs from 'fs-extra'

const cssMatcher = (file: string) => /.+\.(?:wx|ac|jx|tt|q|c)ss$/.test(file)
const htmlMatcher = (file: string) => /.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/.test(file)
const jsMatcher = (file: string) => {
  if (file.includes('node_modules')) {
    return false
  }
  return /.+\.[cm]?[jt]s?$/.test(file)
}

export { cssMatcher, htmlMatcher, jsMatcher }

export function touch(filename: string) {
  const time = new Date()

  try {
    fs.utimesSync(filename, time, time)
  } catch {
    fs.closeSync(fs.openSync(filename, 'w'))
  }
}

export { default as set } from 'set-value'
export { default as get } from 'get-value'

export function isObject(x: unknown): x is Record<string | symbol | number, unknown> {
  return typeof x === 'object' && x !== null
}

export function promisify(task: Transform | Transform[]) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(task)) {
      Promise.all(task.map((x) => promisify(x)))
        .then(resolve)
        .catch(reject)
    } else {
      if (task.destroyed) {
        resolve(undefined)
        return
      }
      task.on('finish', resolve).on('error', reject)
    }
  })
}
