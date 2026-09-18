import type { ChildProcess } from 'node:child_process'
import { Buffer } from 'node:buffer'
import { StringDecoder } from 'node:string_decoder'
import { setTimeout } from 'node:timers/promises'
import { stripVTControlCharacters } from 'node:util'

export type AppUpdateMode = 'hmr' | 'native-reload'

export function classifyHmrStep(output: string) {
  const text = stripVTControlCharacters(output)
  if (text.includes('热更新失败')) {
    return 'failed'
  }
  if (/安装\s*\.hap\s*到|正在安装(?:HBuilder|uni-app x)调试基座|(?:HBuilder|uni-app x)调试基座安装成功/.test(text)) {
    return 'reinstalled'
  }
  if (text.includes('App Launch')) {
    return 'restarted'
  }
  return text.includes('热更新完成') ? 'updated' : 'pending'
}

/** 在首次运行完成后、源码写入前监听，保留本轮全部日志，避免滚动窗口丢失失败。 */
export function observeHmrStep(
  child: ChildProcess,
  platform: 'app-android' | 'app-ios' | 'app-harmony' = 'app-harmony',
  mode: AppUpdateMode = 'hmr',
) {
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
  const modeLabel = mode === 'native-reload' ? '原生热重载' : '纯 HMR'
  const snapshot = () => ({
    mode,
    state: classifyHmrStep(output()),
    appLaunchCount: stripVTControlCharacters(output()).match(/App Launch/g)?.length ?? 0,
  })
  const assertNoFallback = () => {
    if (overflow) {
      throw new Error(`${modeLabel} 单轮日志超过 32 MiB，不能确认运行结果`)
    }
    const state = classifyHmrStep(output())
    if (mode === 'native-reload' && state === 'restarted') {
      return
    }
    if (state !== 'pending' && state !== 'updated') {
      const reason = mode === 'native-reload' ? '更新失败或重装不能计作原生热重载' : '增量重启或重装不能计作保持运行状态的更新'
      throw new Error(`${modeLabel} 验收失败：${state}；${reason}\n${output()}`)
    }
  }
  return {
    assertNoFallback,
    snapshot,
    async waitForCompletion(timeoutMs: number, ensureRunning: () => void) {
      // Android/iOS 由产物与运行时探针确认更新，生命周期策略由用例显式声明。
      if (platform !== 'app-harmony') {
        ensureRunning()
        assertNoFallback()
        return
      }
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
