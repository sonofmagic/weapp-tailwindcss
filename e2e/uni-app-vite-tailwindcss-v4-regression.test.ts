import fs from 'node:fs/promises'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { replaceWxml } from '../packages/weapp-tailwindcss/src/wxml'
import { clearProjectBuildState, ensureProjectBuilt } from './projectTest'

const projectRoot = path.resolve(__dirname, '../demo/uni-app-vite-tailwindcss-v4')
const outputRoot = path.resolve(projectRoot, 'dist/build/mp-weixin')

describe('uni-app vite tailwindcss v4 regression', () => {
  it('builds @apply min-w-0 and dynamic arbitrary wxml classes', async () => {
    await clearProjectBuildState(projectRoot)
    await ensureProjectBuilt(projectRoot)

    const [wxml, js, wxss, appWxss] = await Promise.all([
      fs.readFile(path.resolve(outputRoot, 'pages/index/index.wxml'), 'utf8'),
      fs.readFile(path.resolve(outputRoot, 'pages/index/index.js'), 'utf8'),
      fs.readFile(path.resolve(outputRoot, 'pages/index/index.wxss'), 'utf8'),
      fs.readFile(path.resolve(outputRoot, 'app.wxss'), 'utf8'),
    ])

    for (const raw of ['h-[458rpx]', 'w-[218rpx]', 'inset-x-[30%]']) {
      expect(js).toContain(replaceWxml(raw))
      expect(wxml).not.toContain(raw)
      expect(js).not.toContain(raw)
    }

    expect(wxss).not.toContain('@apply')
    expect(wxss).toContain('.uni-vite-v4-apply-regression')
    expect(wxss).toContain('min-width:')
    expect(appWxss).toContain(replaceWxml('h-[458rpx]'))
    expect(appWxss).toContain(replaceWxml('w-[218rpx]'))
    expect(appWxss).toContain(replaceWxml('inset-x-[30%]'))
  })
})
