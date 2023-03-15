import * as vite from 'vite'
import type { RollupOutput } from 'rollup'
import { ViteWeappTailwindcssPlugin as vwt } from '@/framework/vite/index'
import path from 'path'
import { switch2relative } from './util'
function noop() {}
function keepSilent() {
  console.log = noop
  console.warn = noop
}
describe.skip('vite test', () => {
  beforeEach(() => {
    keepSilent()
  })
  it('vite common build', async () => {
    // 注意： 打包成 h5 和 app 都不需要开启插件配置
    const isH5 = process.env.UNI_PLATFORM === 'h5'
    const isApp = process.env.UNI_PLATFORM === 'app'
    const WeappTailwindcssDisabled = isH5 || isApp

    // vite 插件配置
    const vitePlugins = []
    // postcss 插件配置
    const postcssPlugins = [
      require('autoprefixer')(),
      require('tailwindcss')({
        config: path.resolve(__dirname, './config/tailwind.config.js')
      })
    ]
    if (!WeappTailwindcssDisabled) {
      vitePlugins.push(vwt())

      postcssPlugins.push(
        require('postcss-rem-to-responsive-pixel')({
          rootValue: 32,
          propList: ['*'],
          transformUnit: 'rpx'
        })
      )
      // postcssPlugins.push(postcssWeappTailwindcssRename({}))
    }

    const res = (await vite.build({
      root: path.resolve(__dirname, './fixtures/vite'),
      plugins: vitePlugins,

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
    output[0].facadeModuleId = switch2relative(output[0].facadeModuleId)
    Object.keys(output[0].modules).forEach((x) => {
      const item = output[0].modules[x]
      // @ts-ignore
      delete output[0].modules[x].originalLength
      if (path.isAbsolute(x)) {
        output[0].modules[switch2relative(x)] = item
        delete output[0].modules[x]
      }
    })

    expect(res.output).toMatchSnapshot()
  })
})
