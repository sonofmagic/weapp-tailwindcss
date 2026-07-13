import type { Plugin, ResolvedConfig } from 'vite'
import { describe, expect, it, vi } from 'vitest'
import { wrapViteCssPostTransform } from '@/bundlers/vite/watch-css-post'

function createResolvedConfig(plugin: Plugin) {
  return {
    plugins: [plugin],
  } as ResolvedConfig
}

function getTransformHandler(plugin: Plugin) {
  const hook = plugin.transform
  return typeof hook === 'object' ? hook.handler : hook
}

describe('bundlers/vite watch css post', () => {
  it('transforms css before the original framework cache hook runs', async () => {
    const hookContext = { marker: 'css-post' }
    const original = vi.fn(function (this: unknown, css: string, id: string) {
      return {
        code: css,
        id,
        context: this,
      }
    })
    const plugin = {
      name: 'vite:css-post',
      transform: original,
    } as Plugin
    const transformCss = vi.fn(async (css: string) => css.replace('.raw', '.safe'))

    expect(wrapViteCssPostTransform(createResolvedConfig(plugin), transformCss)).toBe(true)
    const result = await getTransformHandler(plugin)?.call(hookContext, '.raw{}', '/src/App.vue?vue&type=style')

    expect(transformCss).toHaveBeenCalledWith('.raw{}', '/src/App.vue?vue&type=style')
    expect(original).toHaveBeenCalledWith('.safe{}', '/src/App.vue?vue&type=style')
    expect(result).toEqual({
      code: '.safe{}',
      id: '/src/App.vue?vue&type=style',
      context: hookContext,
    })
  })

  it('preserves object hook metadata and does not wrap the same cache twice', () => {
    const plugin = {
      name: 'vite:css-post',
      transform: {
        order: 'post',
        handler: vi.fn(),
      },
    } as Plugin
    const config = createResolvedConfig(plugin)
    const transformCss = vi.fn(async (css: string) => css)

    expect(wrapViteCssPostTransform(config, transformCss)).toBe(true)
    expect(wrapViteCssPostTransform(config, transformCss)).toBe(false)
    expect(plugin.transform).toMatchObject({ order: 'post' })
  })

  it('leaves configs without a css post hook unchanged', () => {
    const plugin = { name: 'vite:uni' } as Plugin
    expect(wrapViteCssPostTransform(createResolvedConfig(plugin), async css => css)).toBe(false)
    expect(plugin.transform).toBeUndefined()
  })
})
