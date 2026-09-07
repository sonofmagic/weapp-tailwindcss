import assert from 'node:assert/strict'
import { createWriteStream } from 'node:fs'
import { createServer } from 'node:net'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import { stripVTControlCharacters } from 'node:util'
import { execa } from 'execa'

export function developmentEnvironment(env) {
  return {
    ...env,
    NODE_ENV: 'development',
    BROWSERSLIST_ENV: 'development',
  }
}

export async function freePort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}

export function start(args, cwd, env, logFile) {
  let log = ''
  const output = logFile ? createWriteStream(logFile) : undefined
  const child = execa('pnpm', args, { cwd, env: { CI: '1', ...env }, detached: process.platform !== 'win32', reject: false })
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (data) => {
      log += data.toString()
      output?.write(data)
    })
  }
  const done = child.then((result) => {
    output?.end()
    return result
  })
  return {
    log: () => log,
    done,
    ensureRunning() {
      assert.equal(child.exitCode, null, log)
      assert.equal(child.signalCode, null, log)
    },
    async stop() {
      if (child.exitCode === null && child.signalCode === null) {
        if (process.platform === 'win32') {
          await execa('taskkill', ['/pid', String(child.pid), '/T', '/F'], { reject: false })
        }
        else {
          try {
            process.kill(-child.pid, 'SIGTERM')
          }
          catch (error) {
            if (error.code !== 'ESRCH') {
              throw error
            }
          }
          await Promise.race([done, delay(3000)])
          if (child.exitCode === null && child.signalCode === null) {
            process.kill(-child.pid, 'SIGKILL')
          }
        }
      }
      await done
    },
  }
}

export async function until(check, session, timeout = 180_000) {
  const deadline = Date.now() + timeout
  let lastError
  while (Date.now() < deadline) {
    session?.ensureRunning()
    try {
      return await check()
    }
    catch (error) { lastError = error }
    await delay(300)
  }
  throw new Error(`${lastError?.stack}\n${session?.log() ?? ''}`)
}

export function assertViteWatchBuildComplete(log, offset = 0) {
  const current = stripVTControlCharacters(log.slice(offset))
  const completed = [...current.matchAll(/built in [\d.]+\s*m?s\./g)].at(-1)
  assert.ok(completed && completed.index > current.lastIndexOf('build started...'), 'Vite has not finished writing this build')
}

export function assertTaroWatchBuildComplete(log, offset = 0) {
  if (log.includes('watching for file changes')) {
    return assertViteWatchBuildComplete(log, offset)
  }
  const current = stripVTControlCharacters(log.slice(offset))
  const completed = current.lastIndexOf('Compiled successfully')
  const lastProgress = Math.max(...['setup (', 'building (', 'sealing ('].map(phase => current.lastIndexOf(phase)))
  assert.ok(completed >= 0 && current.lastIndexOf('Watching...') > completed && completed > lastProgress, 'Taro has not completed this compilation and resumed watching')
}

export function assertUniWatchBuildComplete(log, offset = 0) {
  const current = stripVTControlCharacters(log.slice(offset))
  const completed = current.lastIndexOf('Build complete. Watching for changes')
  assert.ok(completed >= 0 && completed > current.lastIndexOf('Compiling...'), 'uni-app has not completed this compilation')
  if (offset === 0) {
    assert.match(current, /ready in \d+ms\./, 'uni-app watcher is not ready')
  }
}

export function assertGulpWatchBuildComplete(log, offset = 0) {
  const current = stripVTControlCharacters(log.slice(offset))
  const completed = Math.max(current.lastIndexOf('build complete'), offset === 0 ? current.lastIndexOf('watching for changes') : -1)
  const pending = Math.max(...[' is changed', ' is added', ' is deleted', ' failed '].map(event => current.lastIndexOf(event)))
  assert.ok(completed >= 0 && completed > pending, 'Gulp has not completed this compilation and resumed watching')
}

export async function complete(session, timeout = 600_000) {
  let timer
  try {
    const result = await Promise.race([
      session.done,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Build timed out\n${session.log()}`)), timeout) }),
    ])
    assert.equal(result.exitCode, 0, session.log())
  }
  finally {
    clearTimeout(timer)
  }
}
