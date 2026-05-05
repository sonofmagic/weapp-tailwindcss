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
})
