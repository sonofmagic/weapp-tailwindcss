import type { MiniProgram } from '@weapp-vite/miniprogram-automator'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readTemplatePageConfig } from './template-ide/config'
import { assertTemplatePageRendered } from './template-ide/runtime'

describe('template page config contract', () => {
  let dir: string
  let source: string
  let output: string

  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'template-config-'))
    source = path.join(dir, 'source.json')
    output = path.join(dir, 'output.json')
  })
  afterEach(async () => rm(dir, { recursive: true, force: true }))

  it('accepts an omitted native config only when its source is an empty object', async () => {
    await writeFile(source, '{}')
    await expect(readTemplatePageConfig(output, source)).resolves.toEqual({})
    await expect(readTemplatePageConfig(output)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it.each(['{"usingComponents":{"card":"./card"}}', '{"navigationBarTitleText":"Title"}'])('rejects missing non-empty config: %s', async (config) => {
    await writeFile(source, config)
    await expect(readTemplatePageConfig(output, source)).rejects.toThrow('非空页面配置')
  })

  it.each(['null', '[]', 'invalid'])('rejects invalid source config: %s', async (config) => {
    await writeFile(source, config)
    await expect(readTemplatePageConfig(output, source)).rejects.toThrow()
  })

  it('rejects missing source and malformed output even with an empty source', async () => {
    await expect(readTemplatePageConfig(output, source)).rejects.toMatchObject({ code: 'ENOENT' })
    await writeFile(source, '{}')
    await writeFile(output, 'invalid')
    await expect(readTemplatePageConfig(output, source)).rejects.toThrow()
  })

  it('retains emitted component references for artifact checks', async () => {
    await writeFile(output, '{"usingComponents":{"card":"./card"}}')
    await expect(readTemplatePageConfig(output)).resolves.toEqual({ usingComponents: { card: './card' } })
  })
})

describe('template IDE runtime contract', () => {
  function miniProgram(reLaunch: ReturnType<typeof vi.fn>) {
    return { reLaunch } as unknown as Pick<MiniProgram, 'reLaunch'>
  }

  it('fails when the IDE page stack times out', async () => {
    const error = new Error('DevTools did not respond to protocol method App.getPageStack')
    await expect(assertTemplatePageRendered(miniProgram(vi.fn().mockRejectedValue(error)), '/index')).rejects.toBe(error)
  })

  it('fails when the requested page is missing', async () => {
    await expect(assertTemplatePageRendered(miniProgram(vi.fn().mockResolvedValue(undefined)), '/index')).rejects.toThrow('未进入页面')
  })

  it('propagates render timeouts', async () => {
    const error = new Error('render timeout')
    const page = { waitForRendered: vi.fn().mockRejectedValue(error) }
    await expect(assertTemplatePageRendered(miniProgram(vi.fn().mockResolvedValue(page)), '/index')).rejects.toBe(error)
  })

  it.each([
    { nodes: [] },
    { nodes: [{ width: 0, height: 100 }] },
    { nodes: [{ width: 100, height: 0 }] },
    { nodes: [{ width: 100 }] },
  ])('rejects missing or zero-size rendered nodes: $nodes', async ({ nodes }) => {
    const page = { waitForRendered: vi.fn().mockResolvedValue('<view/>'), renderedNodes: vi.fn().mockResolvedValue(nodes) }
    await expect(assertTemplatePageRendered(miniProgram(vi.fn().mockResolvedValue(page)), '/index')).rejects.toThrow('未产生渲染内容')
  })

  it('accepts measured template roots even when the IDE cannot expose page WXML', async () => {
    const nodes = [{ width: 390, height: 753 }]
    const page = { waitForRendered: vi.fn().mockResolvedValue('rendered'), renderedNodes: vi.fn().mockResolvedValue(nodes) }
    const reLaunch = vi.fn().mockResolvedValue(page)
    await expect(assertTemplatePageRendered(miniProgram(reLaunch), '/index')).resolves.toEqual(nodes)
    expect(reLaunch).toHaveBeenCalledExactlyOnceWith('/index')
    expect(page.waitForRendered).toHaveBeenCalledWith({ selector: '.min-h-screen', componentSelectors: ['comp'], timeout: 15_000 })
  })
})
