import { readFile } from 'node:fs/promises'
import path from 'node:path'

const repositoryRoot = path.resolve(__dirname, '../../../..')

async function readProjectFile(relativePath: string) {
  return readFile(path.resolve(repositoryRoot, relativePath), 'utf8')
}

describe('v5 apps and demos generator config', () => {
  it.each([
    {
      config: 'apps/vite-native/vite.config.ts',
      css: 'apps/vite-native/app.css',
    },
    {
      config: 'demo/uni-app-tailwindcss-v4/vite.config.ts',
      css: 'demo/uni-app-tailwindcss-v4/src/main.css',
    },
    {
      config: 'demo/taro-vite-tailwindcss-v4/config/index.ts',
      css: 'demo/taro-vite-tailwindcss-v4/src/app.css',
    },
  ])('uses tailwind v4 standard css entry with forced mini-program generator in $config', async ({ config, css }) => {
    const [configSource, cssSource] = await Promise.all([
      readProjectFile(config),
      readProjectFile(css),
    ])

    expect(configSource).toContain('generator:')
    expect(configSource).toContain("mode: 'force'")
    expect(configSource).toContain("target: 'weapp'")
    expect(cssSource).toContain('tailwindcss')
    expect(cssSource).not.toContain('weapp-tailwindcss')
  })

  it('passes generator options through the uni-app-x preset demo', async () => {
    const configSource = await readProjectFile('demo/uni-app-x-hbuilderx-tailwindcss4/vite.config.ts')

    expect(configSource).toContain('uniAppX({')
    expect(configSource).toContain('generator:')
    expect(configSource).toContain("mode: 'force'")
    expect(configSource).toContain("target: 'weapp'")
  })

  it('documents the v5 generator examples for uni-app, taro and mpx', async () => {
    const [docsSource, parityDocsSource] = await Promise.all([
      readProjectFile('website/docs/tailwindcss/v5-generator-examples.mdx'),
      readProjectFile('website/docs/tailwindcss/v5-official-plugin-parity.mdx'),
    ])

    expect(docsSource).toContain('uni-app Vue Vite')
    expect(docsSource).toContain('Taro Vite')
    expect(docsSource).toContain('Mpx')
    expect(docsSource).toContain('UnifiedViteWeappTailwindcssPlugin')
    expect(docsSource).toContain('weapp-tailwindcss/postcss')
    expect(docsSource).toContain("target: 'web'")
    expect(docsSource).toContain('@weapp-tailwindcss/merge')
    expect(parityDocsSource).toContain('@tailwindcss/postcss')
    expect(parityDocsSource).toContain('@tailwindcss/vite')
    expect(parityDocsSource).toContain('weapp-tailwindcss/postcss')
    expect(parityDocsSource).toContain('weapp-tailwindcss/vite')
    expect(parityDocsSource).toContain("target: 'weapp'")
    expect(parityDocsSource).toContain("target: 'web'")
  })

  it('keeps the runnable framework demos covering v5 generator features', async () => {
    const [uniPageSource, taroCssSource, taroPageSource, mpxCssSource, mpxPageSource] = await Promise.all([
      readProjectFile('demo/uni-app-tailwindcss-v4/src/pages/index/index.vue'),
      readProjectFile('demo/taro-vite-tailwindcss-v4/src/app.css'),
      readProjectFile('demo/taro-vite-tailwindcss-v4/src/pages/index/index.tsx'),
      readProjectFile('demo/mpx-tailwindcss-v4/src/app.css'),
      readProjectFile('demo/mpx-tailwindcss-v4/src/pages/index.mpx'),
    ])

    expect(uniPageSource).toContain("twMerge('bg-[#0000ff] text-[45rpx]'")
    expect(taroCssSource).toContain('@source "./pages/**/*.{ts,tsx,jsx,js}";')
    expect(taroCssSource).toContain('@theme')
    expect(taroPageSource).toContain('@weapp-tailwindcss/merge')
    expect(taroPageSource).toContain('twJoin(')
    expect(taroPageSource).toContain('hoverClass=')
    expect(taroPageSource).toContain('dark:bg-zinc-800')
    expect(taroPageSource).toContain('!border-brand')
    expect(mpxCssSource).toContain('@theme')
    expect(mpxPageSource).toContain('@weapp-tailwindcss/merge')
    expect(mpxPageSource).toContain(':class="mergedClass"')
  })

  it('uses the postcss generator path for the mpx tailwind v4 demo', async () => {
    const [configSource, postcssConfigSource, cssSource] = await Promise.all([
      readProjectFile('demo/mpx-tailwindcss-v4/mpx.config.js'),
      readProjectFile('demo/mpx-tailwindcss-v4/postcss.config.js'),
      readProjectFile('demo/mpx-tailwindcss-v4/src/app.css'),
    ])

    expect(configSource).toContain("require('weapp-tailwindcss/postcss')")
    expect(configSource).toContain('weappTailwindcss({')
    expect(configSource).toContain("mode: 'force'")
    expect(configSource).toContain("target: 'weapp'")
    expect(configSource).toContain('generator: false')
    expect(postcssConfigSource).toContain("require('weapp-tailwindcss/postcss')")
    expect(cssSource).toContain('@import "tailwindcss";')
    expect(cssSource).toContain('@source "../src";')
    expect(cssSource).not.toContain('@import "weapp-tailwindcss";')
  })
})
