import { describe, it, expect } from 'vitest'
import { build } from 'vite'
import type { RollupOutput } from 'rollup'
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from '@/vite/index'
import path from 'path'

describe('vite test', () => {
  it('vite common build', async () => {
    // 注意： 打包成 h5 和 app 都不需要开启插件配置
    const isH5 = process.env.UNI_PLATFORM === 'h5'
    const isApp = process.env.UNI_PLATFORM === 'app'
    const WeappTailwindcssDisabled = isH5 || isApp

    // vite 插件配置
    const vitePlugins = []
    // postcss 插件配置
    const postcssPlugins = [
      // require('autoprefixer')(),
      require('tailwindcss')({
        config: path.resolve(__dirname, './fixtures/vite/tailwind.config.js')
      })
    ]
    if (!WeappTailwindcssDisabled) {
      vitePlugins.push(uvwt())

      // postcssPlugins.push(
      //   require('postcss-rem-to-responsive-pixel')({
      //     rootValue: 32,
      //     propList: ['*'],
      //     transformUnit: 'rpx'
      //   })
      // )
      // postcssPlugins.push(postcssWeappTailwindcssRename({}))
    }

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
    // @ts-ignore
    // output[0].facadeModuleId = switch2relative(output[0].facadeModuleId)
    // Object.keys(output[0].modules).forEach((x) => {
    //   const item = output[0].modules[x]
    //   // @ts-ignore
    //   delete output[0].modules[x].originalLength
    //   if (path.isAbsolute(x)) {
    //     output[0].modules[switch2relative(x)] = item
    //     delete output[0].modules[x]
    //   }
    // })
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
  })
})
