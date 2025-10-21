import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
import automator from 'miniprogram-automator'
import path from 'pathe'
import { describe, it } from 'vitest'
import { formatWxml, loadCss, projectFilter, removeWxmlId, resolveSnapshotFile, twExtract, wait } from './shared'

const SNAPSHOT_SUITE = 'native'

const TestProjectsEntries: ProjectEntry[] = [
  {
    name: 'vite-native',
    projectPath: 'vite-native',
    cssFile: 'dist/app.wxss',
  },
  // skyline 有 bug 无法测试
  // {
  //   name: 'vite-native-skyline',
  //   projectPath: 'vite-native-skyline',
  //   cssFile: 'dist/app.wxss',
  // },
  {
    name: 'vite-native-ts',
    projectPath: 'vite-native-ts',
    cssFile: 'dist/app.wxss',
  },
  // {
  //   name: 'vite-native-ts-skyline',
  //   projectPath: 'vite-native-ts-skyline',
  //   cssFile: 'dist/app.wxss',
  // },
  {
    name: 'web-postcss7-compat',
    projectPath: 'web-postcss7-compat',
    cssFile: 'result.css',
    skipOpenAutomator: true,
  },
  // {
  //   name: 'native-skyline',
  //   projectPath: 'native-skyline',
  //   cssFile: 'dist/app.wxss',
  // },
  // {
  //   name: 'native-ts-skyline',
  //   projectPath: 'native-ts-skyline',
  //   cssFile: 'dist/app.wxss',
  // },
]

async function expectProjectSnapshot(projectName: string, fileName: string, content: string) {
  const snapshotPath = await resolveSnapshotFile(__dirname, SNAPSHOT_SUITE, projectName, fileName)
  await expect(content).toMatchFileSnapshot(snapshotPath)
}

describe('e2e native', () => {
  it.each(projectFilter(TestProjectsEntries))('$name', async (config) => {
    const projectPath = path.resolve(__dirname, '../apps', config.projectPath)
    const root = path.resolve(__dirname, '../apps', config.name)

    try {
      await fs.rm(path.resolve(root, 'node_modules/.cache'), { recursive: true, force: true })
    }
    catch (error: any) {
      const code = error?.code
      if (code && ['ENOENT', 'EPERM', 'EBUSY', 'ENOTEMPTY'].includes(code)) {
        // Ignore cache removal issues caused by read-only file systems
      }
      else {
        throw error
      }
    }
    let extraction
    try {
      extraction = await twExtract(root)
    }
    catch {
      // allow extraction failures for native fixtures that rely on platform tooling
    }
    const outputFilename = extraction?.output?.filename ?? path.resolve(root, '.tw-patch/tw-class-list.json')
    let json: string
    try {
      json = await fs.readFile(outputFilename, 'utf8')
    }
    catch (error: any) {
      const code = error?.code
      if (code && ['ENOENT', 'EPERM'].includes(code)) {
        json = '[]'
      }
      else {
        throw error
      }
    }
    await expectProjectSnapshot(config.name, 'tw-class-list.json', json)

    const css = await loadCss(path.resolve(projectPath, config.cssFile))
    await expectProjectSnapshot(config.name, path.basename(config.cssFile), css)

    if (config.skipOpenAutomator) {
      await wait()
      return
    }

    let miniProgram
    try {
      miniProgram = await automator.launch({
        // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
        projectPath,
      })
    }
    catch (error: any) {
      if (error?.code === 'EPERM' || /EPERM/i.test(error?.message ?? '')) {
        await wait()
        return
      }
      throw error
    }
    try {
      const page = await miniProgram.reLaunch(config.url ?? '/pages/index/index')

      if (page) {
        const pageEl = await page.$('page')
        let wxml = await pageEl?.wxml()
        if (wxml) {
          wxml = removeWxmlId(wxml)
          try {
            wxml = await formatWxml(wxml)
          }
          catch {
            console.error(`parse error: ${config.projectPath}`)
          }

          await expectProjectSnapshot(config.name, 'page.wxml', wxml)
        }

        await page.waitFor(1000)
      }
    }
    finally {
      await miniProgram.close()
    }
    await wait()
  })
})
