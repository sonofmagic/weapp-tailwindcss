import Module from 'node:module'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { installTailwindcssCssRedirect } from '@/shared/tailwindcss-css-redirect'

type ResolveFilenameFn = (
  request: string,
  parent?: unknown,
  isMain?: boolean,
  options?: unknown,
) => string

const mutableModule = Module as typeof Module & { _resolveFilename: ResolveFilenameFn }
const originalResolveFilename = mutableModule._resolveFilename

describe('tailwindcss css redirect', () => {
  afterEach(() => {
    mutableModule._resolveFilename = originalResolveFilename
    vi.restoreAllMocks()
  })

  it('redirects tailwindcss package requests to css files', () => {
    const fallback = vi.fn((request: string) => `fallback:${request}`)
    mutableModule._resolveFilename = fallback

    installTailwindcssCssRedirect('/packages/tailwindcss')
    const resolve = mutableModule._resolveFilename

    expect(resolve('tailwindcss')).toBe(path.join('/packages/tailwindcss', 'index.css'))
    expect(resolve('tailwindcss$')).toBe(path.join('/packages/tailwindcss', 'index.css'))
    expect(resolve('tailwindcss/theme.css')).toBe(path.join('/packages/tailwindcss', 'theme.css'))
    expect(resolve('other-package')).toBe('fallback:other-package')
    expect(fallback).toHaveBeenCalledWith('other-package', undefined, undefined, undefined)
  })

  it('does not wrap an already patched resolver again', () => {
    mutableModule._resolveFilename = vi.fn((request: string) => `fallback:${request}`)

    installTailwindcssCssRedirect('/first')
    const firstPatched = mutableModule._resolveFilename
    installTailwindcssCssRedirect('/second')

    expect(mutableModule._resolveFilename).toBe(firstPatched)
    expect(mutableModule._resolveFilename('tailwindcss')).toBe(path.join('/first', 'index.css'))
  })
})
