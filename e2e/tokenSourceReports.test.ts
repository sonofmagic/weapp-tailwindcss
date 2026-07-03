import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { replaceWxml } from '../packages/weapp-tailwindcss/src/wxml'
import { collectTokenSourceReports, formatTokenSourceFileReport } from './tokenSourceReports'

async function createTempProject() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'weapp-tw-token-report-'))
}

describe('token source reports', () => {
  it('records extracted final tokens for scanned source files with matches', async () => {
    const root = await createTempProject()
    await fs.mkdir(path.resolve(root, 'src/pages'), { recursive: true })
    await fs.mkdir(path.resolve(root, 'packageB/pages'), { recursive: true })

    await fs.writeFile(path.resolve(root, 'app.css'), [
      '@import "tailwindcss" source(none);',
      '@source "./src/pages";',
      '@source "./packageB/pages";',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'src/pages/index.vue'), [
      '<template>',
      '  <view class="h-8 bg-[#123456]"></view>',
      '</template>',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'packageB/pages/index.wxml'), '<view class="rotate-y-90"></view>')
    await fs.writeFile(path.resolve(root, 'src/pages/empty.ts'), 'export const label = "not-a-class-token"')

    const collection = await collectTokenSourceReports(root, [
      'bg-[#123456]',
      'h-8',
      'rotate-y-90',
    ])

    expect(collection?.sourceReports).toEqual([
      {
        file: 'packageB/pages/index.wxml',
        count: 1,
        tokens: ['rotate-y-90'],
      },
      {
        file: 'src/pages/index.vue',
        count: 2,
        tokens: ['bg-[#123456]', 'h-8'],
      },
    ])

    expect(collection?.tokenSources.get(replaceWxml('bg-[#123456]'))).toEqual({
      token: 'bg-[#123456]',
      sources: ['src/pages/index.vue'],
    })
    expect(formatTokenSourceFileReport(collection!.sourceReports[1]!)).toBe([
      '{',
      '  "file": "src/pages/index.vue",',
      '  "count": 2,',
      '  "tokens": [',
      '    "bg-[#123456]",',
      '    "h-8"',
      '  ]',
      '}',
      '',
    ].join('\n'))
  })

  it('merges css @source entries with tailwind config content entries', async () => {
    const root = await createTempProject()
    await fs.mkdir(path.resolve(root, 'src/pages'), { recursive: true })
    await fs.mkdir(path.resolve(root, 'src/pages/issue-909'), { recursive: true })

    await fs.writeFile(path.resolve(root, 'app.css'), [
      '@import "tailwindcss" source(none);',
      '@config "./tailwind.config.js";',
      '@source "./src/pages/issue-909";',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'tailwind.config.js'), [
      'module.exports = {',
      '  content: ["./src/pages/**/*.{tsx,wxml}"],',
      '}',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'src/pages/index.tsx'), '<View className="h-14"></View>')
    await fs.writeFile(path.resolve(root, 'src/pages/issue-909/index.tsx'), '<View className="rotate-y-90"></View>')

    const collection = await collectTokenSourceReports(root, [
      'h-14',
      'rotate-y-90',
    ])

    expect(collection?.tokenSources.get('h-14')).toEqual({
      token: 'h-14',
      sources: ['src/pages/index.tsx'],
    })
    expect(collection?.tokenSources.get('rotate-y-90')).toEqual({
      token: 'rotate-y-90',
      sources: ['src/pages/issue-909/index.tsx'],
    })
  })

  it('collects sources from preprocessor and single file component tailwind entries', async () => {
    const root = await createTempProject()
    await fs.mkdir(path.resolve(root, 'pages/index'), { recursive: true })
    await fs.mkdir(path.resolve(root, 'src/pages'), { recursive: true })

    await fs.writeFile(path.resolve(root, 'app.scss'), [
      '// Tailwind root entry intentionally lives in SCSS.',
      '@import "tailwindcss";',
      '@source "./pages/**/*.{wxml,ts}";',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'src/app.mpx'), [
      '<script>export default {}</script>',
      '<style lang="scss">',
      '  @config "../tailwind.config.js";',
      '  @import "tailwindcss/utilities.css";',
      '</style>',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'tailwind.config.js'), [
      'module.exports = {',
      '  content: ["./src/pages/**/*.mpx"],',
      '}',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'pages/index/index.wxml'), '<view class="size-8"></view>')
    await fs.writeFile(path.resolve(root, 'src/pages/index.mpx'), '<template><view class="h-[43rpx]"></view></template>')

    const collection = await collectTokenSourceReports(root, [
      'h-[43rpx]',
      'size-8',
    ])

    expect(collection?.tokenSources.get('h-[43rpx]')).toEqual({
      token: 'h-[43rpx]',
      sources: ['src/pages/index.mpx'],
    })
    expect(collection?.tokenSources.get('size-8')).toEqual({
      token: 'size-8',
      sources: ['pages/index/index.wxml'],
    })
  })

  it('loads dynamic tailwind config content when static parsing cannot resolve it', async () => {
    const root = await createTempProject()
    await fs.mkdir(path.resolve(root, 'src/pages'), { recursive: true })

    await fs.writeFile(path.resolve(root, 'app.css'), [
      '@config "./tailwind.config.js";',
      '@tailwind utilities;',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'tailwind.config.js'), [
      'const ext = "wxml"',
      'module.exports = {',
      '  content: [`./src/pages/**/*.${' + 'ext}`],',
      '}',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'src/pages/index.wxml'), '<view class="bg-[red]"></view>')

    const collection = await collectTokenSourceReports(root, [
      'bg-[red]',
    ])

    expect(collection?.tokenSources.get('bg-[red]')).toEqual({
      token: 'bg-[red]',
      sources: ['src/pages/index.wxml'],
    })
  })

  it('records utility sources from css @apply directives', async () => {
    const root = await createTempProject()
    await fs.mkdir(path.resolve(root, 'src'), { recursive: true })

    await fs.writeFile(path.resolve(root, 'src/tailwind.scss'), [
      '@config "../tailwind.config.js";',
      '@tailwind utilities;',
      '.btn {',
      '  @apply bg-red-500/50 transition;',
      '}',
    ].join('\n'))
    await fs.writeFile(path.resolve(root, 'tailwind.config.js'), [
      'module.exports = {',
      '  content: ["./src/**/*.{scss,vue}"],',
      '}',
    ].join('\n'))

    const collection = await collectTokenSourceReports(root, [
      'bg-red-500/50',
      'transition',
    ])

    expect(collection?.tokenSources.get('bg-red-500/50')).toEqual({
      token: 'bg-red-500/50',
      sources: ['src/tailwind.scss'],
    })
    expect(collection?.tokenSources.get('transition')).toEqual({
      token: 'transition',
      sources: ['src/tailwind.scss'],
    })
  })
})
