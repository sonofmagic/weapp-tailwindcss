import { afterEach, expect, it, vi } from 'vitest'
import { waitForTaroComponents } from '../component-ready.mjs'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

it('网络与文档已就绪时仍等待所有组件的首轮渲染，不把尚未应用的样式计作完成', async () => {
  let ready
  let completed = false
  const component = { localName: 'taro-view-core', componentOnReady: () => new Promise(resolve => { ready = resolve }) }
  vi.stubGlobal('document', { readyState: 'complete', querySelectorAll: () => [component, { localName: 'div' }] })
  const waiting = waitForTaroComponents().then(() => { completed = true })
  await Promise.resolve()
  expect(completed).toBe(false)
  ready(component)
  await waiting
  expect(completed).toBe(true)
})

it('未注册与渲染拒绝保留失败，组件永不就绪也不会让外层轮询无限挂起', async () => {
  vi.stubGlobal('document', { querySelectorAll: () => [{ localName: 'taro-view-core' }] })
  await expect(waitForTaroComponents()).rejects.toThrow('尚未注册')
  document.querySelectorAll = () => [{ localName: 'taro-view-core', componentOnReady: () => Promise.reject(new Error('render failed')) }]
  await expect(waitForTaroComponents()).rejects.toThrow('render failed')
  vi.useFakeTimers()
  document.querySelectorAll = () => [{ localName: 'taro-view-core', componentOnReady: () => new Promise(() => {}) }]
  const assertion = expect(waitForTaroComponents(100)).rejects.toThrow('首轮渲染')
  await vi.advanceTimersByTimeAsync(100)
  await assertion
  expect(vi.getTimerCount()).toBe(0)
})
