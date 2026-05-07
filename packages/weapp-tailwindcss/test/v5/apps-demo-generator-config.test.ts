import { readFile } from 'node:fs/promises'
import path from 'node:path'

const repositoryRoot = path.resolve(__dirname, '../../../..')

async function readProjectFile(relativePath: string) {
  return readFile(path.resolve(repositoryRoot, relativePath), 'utf8')
}

async function readProjectJson<T>(relativePath: string) {
  return JSON.parse(await readProjectFile(relativePath)) as T
}

describe('v5 apps and demos generator config', () => {
  it('keeps v5 generator demos as standalone workspace packages', async () => {
    const packages = await Promise.all([
      readProjectJson<{ name: string, scripts?: Record<string, string>, private?: boolean }>('demo/uni-app-tailwindcss-v5/package.json'),
      readProjectJson<{ name: string, scripts?: Record<string, string>, private?: boolean }>('demo/taro-vite-tailwindcss-v5/package.json'),
      readProjectJson<{ name: string, scripts?: Record<string, string>, private?: boolean }>('demo/mpx-tailwindcss-v5/package.json'),
    ])

    expect(packages.map(item => item.name)).toEqual([
      '@weapp-tailwindcss-demo/uni-app-tailwindcss-v5',
      '@weapp-tailwindcss-demo/taro-vite-tailwindcss-v5',
      '@weapp-tailwindcss-demo/mpx-tailwindcss-v5',
    ])
    expect(packages.every(item => item.private)).toBe(true)
    expect(packages.every(item => typeof item.scripts?.build === 'string')).toBe(true)
  })

  it.each([
    {
      config: 'apps/vite-native/vite.config.ts',
      css: 'apps/vite-native/app.css',
    },
    {
      config: 'demo/uni-app-tailwindcss-v5/vite.config.ts',
      css: 'demo/uni-app-tailwindcss-v5/src/main.css',
    },
    {
      config: 'demo/taro-vite-tailwindcss-v5/config/index.ts',
      css: 'demo/taro-vite-tailwindcss-v5/src/app.css',
    },
  ])('uses tailwind v4 standard css entry with forced mini-program generator in $config', async ({ config, css }) => {
    const [configSource, cssSource] = await Promise.all([
      readProjectFile(config),
      readProjectFile(css),
    ])

    expect(configSource).toContain('generator')
    expect(configSource).toContain('resolve')
    expect(configSource).toContain("mode: 'force'")
    expect(configSource).toContain("target: 'weapp'")
    expect(cssSource).toContain('tailwindcss')
    expect(cssSource).not.toContain('weapp-tailwindcss')
  })

  it('keeps uni-app v5 css entries using @config relative to the css file', async () => {
    const [mainCss, commonCss] = await Promise.all([
      readProjectFile('demo/uni-app-tailwindcss-v5/src/main.css'),
      readProjectFile('demo/uni-app-tailwindcss-v5/src/common.css'),
    ])

    expect(mainCss).toContain('@config "../tailwind.config.js";')
    expect(commonCss).toContain('@config "../tailwind.config.order.js";')
  })

  it('passes generator options through the uni-app-x preset demo', async () => {
    const configSource = await readProjectFile('demo/uni-app-x-hbuilderx-tailwindcss4/vite.config.ts')

    expect(configSource).toContain('uniAppX({')
    expect(configSource).toContain('generator:')
    expect(configSource).toContain("mode: 'force'")
    expect(configSource).toContain("target: 'weapp'")
  })

  it('documents the v5 generator examples for uni-app, taro and mpx', async () => {
    const [
      overviewDocsSource,
      uniAppDocsSource,
      taroDocsSource,
      weappViteDocsSource,
      mpxDocsSource,
      parityDocsSource,
    ] = await Promise.all([
      readProjectFile('website/docs/quick-start/v4/v5-generator-examples.mdx'),
      readProjectFile('website/docs/quick-start/v4/generator/uni-app.mdx'),
      readProjectFile('website/docs/quick-start/v4/generator/taro.mdx'),
      readProjectFile('website/docs/quick-start/v4/generator/weapp-vite.mdx'),
      readProjectFile('website/docs/quick-start/v4/generator/mpx.mdx'),
      readProjectFile('website/docs/tailwindcss/v5-official-plugin-parity.mdx'),
    ])
    const docsSource = [
      overviewDocsSource,
      uniAppDocsSource,
      taroDocsSource,
      weappViteDocsSource,
      mpxDocsSource,
    ].join('\n')

    expect(docsSource).toContain('uni-app Vue Vite')
    expect(docsSource).toContain('Taro Vite')
    expect(docsSource).toContain('weapp-vite')
    expect(docsSource).toContain('Mpx')
    expect(docsSource).toContain('WeappTailwindcss')
    expect(docsSource).toContain('weapp-tailwindcss/postcss')
    expect(docsSource).toContain("target: 'web'")
    expect(docsSource).toContain('@weapp-tailwindcss/merge')
    expect(docsSource).toContain('tailwindcss@3')
    expect(docsSource).toContain('tailwindcss@4')
    expect(docsSource).toContain('不需要再配置 `postinstall` 脚本')
    expect(docsSource).toContain('不要再把 `@tailwindcss/vite`、`@tailwindcss/postcss` 或 `tailwindcss` PostCSS 插件注册到实际项目里')
    expect(docsSource).toContain('Tailwind CSS v3 项目继续使用')
    expect(docsSource).toContain('Tailwind CSS v3 和 v4 都会默认由 `weapp-tailwindcss` 接管样式生成')
    expect(overviewDocsSource).toContain('./generator/uni-app')
    expect(overviewDocsSource).toContain('./generator/taro')
    expect(overviewDocsSource).toContain('./generator/weapp-vite')
    expect(overviewDocsSource).toContain('./generator/mpx')
    expect(docsSource).not.toContain('postcss-config-loader-plugin')
    expect(parityDocsSource).toContain('@tailwindcss/postcss')
    expect(parityDocsSource).toContain('@tailwindcss/vite')
    expect(parityDocsSource).toContain('weapp-tailwindcss/postcss')
    expect(parityDocsSource).toContain('weapp-tailwindcss/vite')
    expect(parityDocsSource).toContain("target: 'weapp'")
    expect(parityDocsSource).toContain("target: 'web'")
  })

  it('keeps the runnable framework demos covering v5 generator features', async () => {
    const [
      uniPageSource,
      uniPagesJsonSource,
      uniMainCssSource,
      uniCommonCssSource,
      uniOrderHomeSource,
      uniOrderUserSource,
      taroCssSource,
      taroPageSource,
      mpxCssSource,
      mpxPageSource,
    ] = await Promise.all([
      readProjectFile('demo/uni-app-tailwindcss-v5/src/pages/index/index.vue'),
      readProjectFile('demo/uni-app-tailwindcss-v5/src/pages.json'),
      readProjectFile('demo/uni-app-tailwindcss-v5/src/main.css'),
      readProjectFile('demo/uni-app-tailwindcss-v5/src/common.css'),
      readProjectFile('demo/uni-app-tailwindcss-v5/src/pages-order/pages/home/home.vue'),
      readProjectFile('demo/uni-app-tailwindcss-v5/src/pages-order/pages/user/user.vue'),
      readProjectFile('demo/taro-vite-tailwindcss-v5/src/app.css'),
      readProjectFile('demo/taro-vite-tailwindcss-v5/src/pages/index/index.tsx'),
      readProjectFile('demo/mpx-tailwindcss-v5/src/app.css'),
      readProjectFile('demo/mpx-tailwindcss-v5/src/pages/index.mpx'),
    ])

    expect(uniPageSource).toContain("twMerge('bg-[#0000ff] text-[45rpx]'")
    expect(uniPageSource).toContain('bg-gradient-to-r from-cyan-500 to-blue-500')
    expect(uniPageSource).toContain('aspect-[calc(4*3+1)/3]')
    expect(uniPageSource).toContain('weappTwIgnore`bg-[#123498]`')
    expect(uniPagesJsonSource).toContain('"subPackages"')
    expect(uniMainCssSource).toContain('@config "../tailwind.config.js";')
    expect(uniCommonCssSource).toContain('@config "../tailwind.config.order.js";')
    expect(uniOrderHomeSource).toContain('bg-gradient-to-r from-emerald-500 to-cyan-500')
    expect(uniOrderUserSource).toContain('bg-gradient-to-r from-blue-500 to-indigo-500')
    expect(taroCssSource).toContain('@import "tailwindcss" source(none);')
    expect(taroCssSource).toContain('@source "../src/pages/**/*.{ts,tsx,jsx,js}";')
    expect(taroCssSource).toContain('@theme')
    expect(taroPageSource).toContain('@weapp-tailwindcss/merge')
    expect(taroPageSource).toContain('twJoin(')
    expect(taroPageSource).toContain('hoverClass=')
    expect(taroPageSource).toContain('dark:bg-zinc-800')
    expect(taroPageSource).toContain('!border-brand')
    expect(taroPageSource).toContain('bg-gradient-to-r from-cyan-500 to-blue-500')
    expect(taroPageSource).toContain('bg-gradient-to-b from-fuchsia-500 to-rose-500')
    expect(taroPageSource).toContain('bg-linear-to-r from-cyan-500 to-blue-500')
    expect(taroPageSource).toContain('rounded-xl bg-[#123456] p-4 text-white')
    expect(mpxCssSource).toContain('@theme')
    expect(mpxPageSource).toContain('@weapp-tailwindcss/merge')
    expect(mpxPageSource).toContain(':class="mergedClass"')
    expect(mpxPageSource).toContain('space-y-4 flex flex-col bg-red-400')
    expect(mpxPageSource).toContain('border-[10px] border-[#098765] border-solid border-opacity-[0.44]')
    expect(mpxPageSource).toContain('bg-gradient-to-r from-cyan-500 to-blue-500')
  })

  it('uses the webpack generator path for the mpx tailwind v5 demo', async () => {
    const [configSource, postcssConfigSource, cssSource] = await Promise.all([
      readProjectFile('demo/mpx-tailwindcss-v5/mpx.config.js'),
      readProjectFile('demo/mpx-tailwindcss-v5/postcss.config.js'),
      readProjectFile('demo/mpx-tailwindcss-v5/src/app.css'),
    ])

    expect(configSource).toContain("require('@tailwindcss/postcss')")
    expect(configSource).toContain("WEAPP_TW_GENERATOR_MODE !== 'legacy'")
    expect(configSource).toContain("mode: 'force'")
    expect(configSource).toContain("target: 'weapp'")
    expect(configSource).toContain('generator: isGeneratorMode ? generator : false')
    expect(postcssConfigSource).toContain("require('weapp-tailwindcss/postcss')")
    expect(cssSource).toContain('@import "tailwindcss";')
    expect(cssSource).toContain('@source "../src";')
    expect(cssSource).not.toContain('@import "weapp-tailwindcss";')
  })

  it('keeps the historical v4 demos free of v5 generator-only changes', async () => {
    const [
      uniPageSource,
      taroCssSource,
      taroPageSource,
      mpxConfigSource,
      mpxPostcssSource,
      mpxCssSource,
      mpxPageSource,
    ] = await Promise.all([
      readProjectFile('demo/uni-app-tailwindcss-v4/src/pages/index/index.vue'),
      readProjectFile('demo/taro-vite-tailwindcss-v4/src/app.css'),
      readProjectFile('demo/taro-vite-tailwindcss-v4/src/pages/index/index.tsx'),
      readProjectFile('demo/mpx-tailwindcss-v4/mpx.config.js'),
      readProjectFile('demo/mpx-tailwindcss-v4/postcss.config.js'),
      readProjectFile('demo/mpx-tailwindcss-v4/src/app.css'),
      readProjectFile('demo/mpx-tailwindcss-v4/src/pages/index.mpx'),
    ])

    expect(uniPageSource).toContain("const className = ref('bg-[#0000ff] text-[45rpx] text-white')")
    expect(uniPageSource).not.toContain("twMerge('bg-[#0000ff] text-[45rpx]'")
    expect(taroCssSource).toContain('@import "tailwindcss" source(none);')
    expect(taroCssSource).toContain('@source "../src/**/*.{ts,tsx,jsx,js,html}";')
    expect(taroPageSource).not.toContain('@weapp-tailwindcss/merge')
    expect(taroPageSource).not.toContain('hoverClass=')
    expect(mpxConfigSource).toContain("require('@tailwindcss/postcss')")
    expect(mpxConfigSource).not.toContain("require('weapp-tailwindcss/postcss')")
    expect(mpxConfigSource).not.toContain('generator: false')
    expect(mpxPostcssSource).toContain("require('@tailwindcss/postcss')()")
    expect(mpxPostcssSource).not.toContain("require('weapp-tailwindcss/postcss')")
    expect(mpxCssSource).toContain('@import "weapp-tailwindcss";')
    expect(mpxCssSource).not.toContain('@import "tailwindcss";')
    expect(mpxPageSource).not.toContain('mergedClass')
    expect(mpxPageSource).not.toContain('@weapp-tailwindcss/merge')
  })
})
