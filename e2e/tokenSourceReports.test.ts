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
  it('records extracted final tokens for each scanned source file', async () => {
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
        file: 'src/pages/empty.ts',
        count: 0,
        tokens: [],
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
    expect(formatTokenSourceFileReport(collection!.sourceReports[2]!)).toBe([
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
})
