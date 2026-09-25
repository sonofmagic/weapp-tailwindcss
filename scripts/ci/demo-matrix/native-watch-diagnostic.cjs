const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')
const { fileURLToPath } = require('node:url')

const probe = process.env.DEMO_MATRIX_NATIVE_WATCH_FILE
if (probe) {
  const target = path.resolve(probe)
  const original = fs.watch
  let nextId = 0
  const trace = (event, data) => process.stdout.write(`[native-watch] ${JSON.stringify({ event, pid: process.pid, time: new Date().toISOString(), ...data })}\n`)
  const state = () => {
    try {
      const { ino, size, mtimeMs } = fs.statSync(target)
      return { ino, size, mtimeMs }
    }
    catch (error) { return { error: error.code } }
  }
  fs.watch = function (file, ...args) {
    const resolved = path.resolve(file instanceof URL ? fileURLToPath(file) : String(file))
    if (resolved !== target && resolved !== path.dirname(target)) {
      return original.call(this, file, ...args)
    }
    const id = ++nextId
    const caller = new Error('原生监听注册来源').stack
    trace('bind', { id, file: String(file), state: state(), caller })
    const watcher = original.call(this, file, ...args.map(arg => typeof arg === 'function'
      ? function (...events) {
        trace('event', { id, events, state: state() })
        return arg.apply(this, events)
      }
      : arg))
    watcher.once('close', () => trace('close', { id, state: state() }))
    return watcher
  }
}
