import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import { execa } from 'execa'
import { sampleMemory } from './memory.mjs'

export function startProcess(command, args, { cwd, env = {}, logFile, timeout = 600_000 } = {}) {
  let log = ''
  let timedOut = false
  let stopped = false
  let stopping
  let sampling = false
  let peakRssMb = null
  const output = logFile ? createWriteStream(logFile) : undefined
  const child = execa(command, args, {
    cwd, detached: process.platform !== 'win32', reject: false,
    env: { ...process.env, CI: '1', WEAPP_TW_HMR_TIMING: '0', WEAPP_TW_WATCH_REGRESSION: '0', WEAPP_TW_OFFICIAL_POSTCSS_PARITY: '0', ...env },
  })
  const started = performance.now()
  for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { log += data; output?.write(data) })
  const sample = async () => {
    if (sampling || stopped) return
    sampling = true
    try {
      const value = await sampleMemory(child.pid)
      if (value > 0) peakRssMb = Math.max(peakRssMb ?? 0, value)
    }
    finally { sampling = false }
  }
  void sample()
  const timer = setInterval(sample, 250)
  timer.unref()
  const raw = child.then(result => ({ ...result, ms: performance.now() - started }))
  const timeoutTimer = setTimeout(() => { timedOut = true; void stop() }, timeout)
  timeoutTimer.unref()
  const interrupted = () => { void stop() }
  process.once('SIGINT', interrupted)
  process.once('SIGTERM', interrupted)
  function stop() {
    stopping ??= finish()
    return stopping
  }
  async function finish() {
    stopped = true
    clearTimeout(timeoutTimer)
    clearInterval(timer)
    process.removeListener('SIGINT', interrupted)
    process.removeListener('SIGTERM', interrupted)
    if (child.pid) {
      if (process.platform === 'win32') {
        if (child.exitCode === null) await execa('taskkill', ['/pid', String(child.pid), '/T', '/F'], { reject: false })
      }
      else {
        const kill = signal => { try { process.kill(-child.pid, signal) } catch (error) { if (error.code !== 'ESRCH') throw error } }
        kill('SIGTERM')
        await Promise.race([raw, delay(1500)])
        kill('SIGKILL')
      }
    }
    await raw
    if (output) await new Promise(resolve => output.end(resolve))
  }
  return {
    pid: child.pid, log: () => log, stop,
    memory: () => peakRssMb,
    resetMemory: () => { peakRssMb = null; void sample() },
    ensureRunning() {
      if (timedOut || stopped || child.exitCode !== null || child.signalCode !== null) throw new Error(`进程已结束或超时\n${log.slice(-8000)}`)
    },
    async complete() {
      try {
        const result = await raw
        if (timedOut || result.exitCode !== 0) throw new Error(`${timedOut ? '超时' : `退出码 ${result.exitCode}`}：${command} ${args.join(' ')}\n${log.slice(-8000)}`)
        return { ms: result.ms, peakRssMb, stdout: result.stdout }
      }
      finally { await stop() }
    },
  }
}

export async function run(command, args, options = {}) {
  if (options.logFile) await mkdir(path.dirname(options.logFile), { recursive: true })
  return startProcess(command, args, options).complete()
}

export async function waitFor(check, session, timeout = 180_000) {
  const deadline = performance.now() + timeout
  let error
  while (performance.now() < deadline) {
    session?.ensureRunning()
    try { return await check() } catch (caught) { error = caught }
    await delay(30)
  }
  throw new Error(`等待本轮有效产物超时：${error?.stack}\n${session?.log().slice(-8000) ?? ''}`)
}
