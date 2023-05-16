import { describe, it, expect } from 'vitest'
import { PluginOption, build } from 'vite'
import type { RollupOutput } from 'rollup'
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from '@/vite/index'
import path from 'path'
// 注意： 打包成 h5 和 app 都不需要开启插件配置
// const isH5 = process.env.UNI_PLATFORM === 'h5'
// const isApp = process.env.UNI_PLATFORM === 'app'
// const WeappTailwindcssDisabled = isH5 || isApp
// postcss 插件配置
const postcssPlugins = [
  // require('autoprefixer')(),
  require('tailwindcss')({
    config: path.resolve(__dirname, './fixtures/vite/tailwind.config.js')
  })
]
describe('vite test', () => {
  async function assertSnap(plugin: PluginOption) {
    const vitePlugins: PluginOption[] = []

    vitePlugins.push(plugin)

    const res = (await build({
      root: path.resolve(__dirname, './fixtures/vite/src'),
      plugins: vitePlugins,
      logLevel: 'silent',
      css: {
        postcss: {
          plugins: postcssPlugins
        }
      },
      build: {
        write: false
      }
    })) as RollupOutput

    const output = res.output
    expect(output.length).toBe(3)
    expect(output[0].type).toBe('chunk')
    expect(output[0].code).toMatchSnapshot()
    expect(output[1].type).toBe('asset')
    if (output[1].type === 'asset') {
      expect(output[1].source).toMatchSnapshot()
    }
    expect(output[2].type).toBe('asset')
    if (output[2].type === 'asset') {
      expect(output[2].source).toMatchSnapshot()
    }
  }
  it('vite common build', async () => {
    await assertSnap(uvwt())
  })

  it('vite common build with mangle true', async () => {
    await assertSnap(
      uvwt({
        mangle: true
      })
    )
  })

  it('vite common build with mangle options', async () => {
    await assertSnap(
      uvwt({
        mangle: {}
      })
    )
  })

  it('vite common build with mangle options 0', async () => {
    await assertSnap(
      uvwt({
        mangle: {
          classGenerator: {
            classPrefix: ''
          }
        }
      })
    )
  })

  it('vite common build with mangle options mangleClassFilter all true', async () => {
    await assertSnap(
      uvwt({
        mangle: {
          mangleClassFilter(className) {
            return true
          }
        }
      })
    )
  })

  it('vite common build with mangle options mangleClassFilter variables', async () => {
    await assertSnap(
      uvwt({
        mangle: {
          mangleClassFilter(className) {
            return /[[\]]/.test(className)
          }
        }
      })
    )
  })
})
