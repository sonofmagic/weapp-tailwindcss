import type { ChildProcess } from 'node:child_process'
import { Buffer } from 'node:buffer'
import { StringDecoder } from 'node:string_decoder'
import { setTimeout } from 'node:timers/promises'
import { stripVTControlCharacters } from 'node:util'

export function classifyHmrStep(output: string) {
  const text = stripVTControlCharacters(output)
  if (text.includes('热更新失败')) {
    return 'failed'
  }
  if (/安装\s*\.hap\s*到/.test(text)) {
    return 'reinstalled'
  }
  if (text.includes('App Launch')) {
    return 'restarted'
  }
  return text.includes('热更新完成') ? 'updated' : 'pending'
}

/** 在首次运行完成后、源码写入前监听，保留本轮全部日志，避免滚动窗口丢失失败。 */
export function observeHmrStep(child: ChildProcess) {
  const outputs = { stdout: '', stderr: '' }
  let overflow = false
  const subscribe = (name: 'stdout' | 'stderr') => {
    const decoder = new StringDecoder('utf8')
    const receive = (chunk: Buffer | string) => {
      if (overflow) {
        return
      }
      outputs[name] += typeof chunk === 'string' ? chunk : decoder.write(chunk)
      overflow = Buffer.byteLength(outputs.stdout) + Buffer.byteLength(outputs.stderr) > 32 * 1024 * 1024
    }
    child[name]?.on('data', receive)
    return () => child[name]?.off('data', receive)
  }
  const subscriptions = [subscribe('stdout'), subscribe('stderr')]
  const output = () => `${outputs.stdout}\n${outputs.stderr}`
  const assertNoFallback = () => {
    if (overflow) {
      throw new Error('HMR 单轮日志超过 32 MiB，不能确认运行结果')
    }
    const state = classifyHmrStep(output())
    if (state !== 'pending' && state !== 'updated') {
      throw new Error(`纯 HMR 验收失败：${state}；增量重启或重装不能计作保持运行状态的更新\n${output()}`)
    }
  }
  return {
    assertNoFallback,
    async waitForCompletion(timeoutMs: number, ensureRunning: () => void) {
      const startedAt = Date.now()
      while (Date.now() - startedAt < timeoutMs) {
        ensureRunning()
        assertNoFallback()
        if (classifyHmrStep(output()) === 'updated') {
          return
        }
        await setTimeout(100)
      }
      throw new Error(`产物更新后未收到 HBuilderX 热更新完成日志\n${output()}`)
    },
    dispose() {
      subscriptions.forEach(dispose => dispose())
    },
  }
}
