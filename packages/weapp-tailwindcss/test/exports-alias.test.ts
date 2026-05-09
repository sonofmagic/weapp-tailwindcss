import { WeappTailwindcss as GulpWeappTailwindcss, createPlugins } from '@/gulp'
import { WeappTailwindcss, WeappTailwindcss as ViteWeappTailwindcss, weappTailwindcss as viteWeappTailwindcss } from '@/vite'
import { UnifiedWebpackPluginV5, WeappTailwindcss as WebpackWeappTailwindcss, weappTailwindcss as webpackWeappTailwindcss } from '@/webpack'

describe('exports alias', () => {
  it('exports recommended WeappTailwindcss alias for plugin entries', () => {
    expect(ViteWeappTailwindcss).toBe(WeappTailwindcss)
    expect(viteWeappTailwindcss).toBe(WeappTailwindcss)
    expect(WebpackWeappTailwindcss).toBe(UnifiedWebpackPluginV5)
    expect(webpackWeappTailwindcss).toBe(UnifiedWebpackPluginV5)
    expect(GulpWeappTailwindcss).toBe(createPlugins)
  })
})
