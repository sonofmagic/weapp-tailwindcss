import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const reportPath = path.resolve(__dirname, '__snapshots__/taro-plugin-html-style-output/report.json')

describe('taro plugin-html style output snapshots', () => {
  it('records with and without plugin-html outputs for every Taro demo', async () => {
    const report = JSON.parse(await readFile(reportPath, 'utf8')) as Array<{
      project: string
      modes: Array<{
        mode: string
        status: string
        artifacts: Array<{ fileName: string, artifact: string, sha256: string }>
      }>
    }>

    expect(report.map(item => item.project)).toEqual([
      'taro-webpack-react-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v4',
      'taro-webpack-vue3-tailwindcss-v4',
      'taro-vite-vue3-tailwindcss-v4',
    ])

    for (const item of report) {
      expect(item.modes.map(mode => mode.mode), item.project).toEqual([
        'with-plugin-html',
        'without-plugin-html',
      ])
      for (const mode of item.modes) {
        expect(mode.status, `${item.project}:${mode.mode}`).toBe('passed')
        expect(mode.artifacts.map(artifact => artifact.fileName), `${item.project}:${mode.mode}`).toEqual(
          expect.arrayContaining([
            'app.wxss',
            'sub-normal/pages/index.wxss',
            'sub-independent/pages/index.wxss',
          ]),
        )
        expect(mode.artifacts.every(artifact => artifact.artifact.startsWith('artifacts/')), `${item.project}:${mode.mode}`).toBe(true)
        expect(mode.artifacts.every(artifact => /^[a-f0-9]{64}$/.test(artifact.sha256)), `${item.project}:${mode.mode}`).toBe(true)
      }
    }
  })
})
