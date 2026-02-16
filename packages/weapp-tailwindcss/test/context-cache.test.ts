import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getCompilerContext } from '@/context'

const originalEnv = process.env

function clearCompilerContextCache() {
  const holder = globalThis as {
    __WEAPP_TW_COMPILER_CONTEXT_CACHE__?: Map<string, unknown>
  }
  holder.__WEAPP_TW_COMPILER_CONTEXT_CACHE__?.clear()
}

describe('compiler context cache', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    clearCompilerContextCache()
  })

  afterEach(() => {
    process.env = originalEnv
    clearCompilerContextCache()
  })

  it('reuses context for identical option values', () => {
    const ctxA = getCompilerContext({
      cssEntries: ['src/app.weapp.css'],
      cssChildCombinatorReplaceValue: ['view', 'text'],
    })
    const ctxB = getCompilerContext({
      cssChildCombinatorReplaceValue: ['view', 'text'],
      cssEntries: ['src/app.weapp.css'],
    })

    expect(ctxA).toBe(ctxB)
    expect(ctxA.twPatcher).toBe(ctxB.twPatcher)
  })

  it('creates new context when options differ', () => {
    const ctxA = getCompilerContext({
      cssEntries: ['src/app.weapp.css'],
    })
    const ctxB = getCompilerContext({
      cssEntries: ['src/native.weapp.css'],
    })

    expect(ctxA).not.toBe(ctxB)
  })

  it('normalizes maps and regex when building cache keys', () => {
    const ctxA = getCompilerContext({
      customAttributes: new Map<string | RegExp, (string | RegExp)[]>([
        ['view', [/^foo$/, 'bar']],
      ]),
    })
    const ctxB = getCompilerContext({
      customAttributes: new Map<string | RegExp, (string | RegExp)[]>([
        ['view', [/^foo$/, 'bar']],
      ]),
    })

    expect(ctxA).toBe(ctxB)
  })

  it('creates isolated context when runtime package scope differs with implicit basedir', () => {
    const firstProject = path.resolve(process.cwd(), 'demo/uni-app')
    const secondProject = path.resolve(process.cwd(), 'demo/uni-app-vue3-vite')

    process.env.npm_package_json = path.join(firstProject, 'package.json')
    process.env.PNPM_PACKAGE_NAME = '@weapp-tailwindcss-demo/uni-app'
    const ctxA = getCompilerContext()

    process.env.npm_package_json = path.join(secondProject, 'package.json')
    process.env.PNPM_PACKAGE_NAME = '@weapp-tailwindcss-demo/uni-app-vue3-vite'
    const ctxB = getCompilerContext()

    expect(ctxA).not.toBe(ctxB)
    expect(ctxA.tailwindcssBasedir).toBe(firstProject)
    expect(ctxB.tailwindcssBasedir).toBe(secondProject)
  })
})
