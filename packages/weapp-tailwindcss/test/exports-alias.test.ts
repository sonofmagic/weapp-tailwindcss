import { WeappTailwindcss as GulpWeappTailwindcss, createPlugins } from '@/gulp'
import { WeappTailwindcss as ViteWeappTailwindcss, weappTailwindcss as viteWeappTailwindcss } from '@/vite'
import { WeappTailwindcss as WebpackWeappTailwindcss, weappTailwindcss as webpackWeappTailwindcss } from '@/webpack'
import * as rootEntry from '@/index'
import * as viteEntry from '@/vite'
import * as webpackEntry from '@/webpack'

describe('exports alias', () => {
  it('exports recommended WeappTailwindcss alias for plugin entries', () => {
    expect(viteWeappTailwindcss).toBe(ViteWeappTailwindcss)
    expect(webpackWeappTailwindcss).toBe(WebpackWeappTailwindcss)
    expect(GulpWeappTailwindcss).toBe(createPlugins)
  })

  it('does not export legacy webpack plugin names', () => {
    expect('UnifiedWebpackPluginV5' in rootEntry).toBe(false)
    expect('UnifiedWebpackPluginV5' in webpackEntry).toBe(false)
  })

  it('does not export legacy vite plugin names', () => {
    expect('UnifiedViteWeappTailwindcssPlugin' in rootEntry).toBe(false)
    expect('UnifiedViteWeappTailwindcssPlugin' in viteEntry).toBe(false)
  })
})
