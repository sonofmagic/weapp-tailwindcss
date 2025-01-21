import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
import { deleteAsync } from 'del'
import automator from 'miniprogram-automator'
import path from 'pathe'
import { formatWxml, loadCss, projectFilter, removeWxmlId, twExtract, wait } from './shared'

const TestProjectsEntries: ProjectEntry[] = [
  {
    name: 'vite-native',
    projectPath: 'vite-native',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
    },
  },
  // skyline 有 bug 无法测试
  // {
  //   name: 'vite-native-skyline',
  //   projectPath: 'vite-native-skyline',
  //   testMethod: async (_, projectPath) => {
  //     expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
  //   },
  // },
  {
    name: 'vite-native-ts',
    projectPath: 'vite-native-ts',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
    },
  },
  // {
  //   name: 'vite-native-ts-skyline',
  //   projectPath: 'vite-native-ts-skyline',
  //   testMethod: async (_, projectPath) => {
  //     expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
  //   },
  // },
  {
    name: 'web-postcss7-compat',
    projectPath: 'web-postcss7-compat',
    skipOpenAutomator: true,
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'result.css'))).toMatchSnapshot('css')
    },
  },
  // {
  //   name: 'native-skyline',
  //   projectPath: 'native-skyline',
  //   testMethod: async (_, projectPath) => {
  //     expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
  //   },
  // },
  // {
  //   name: 'native-ts-skyline',
  //   projectPath: 'native-ts-skyline',
  //   testMethod: async (_, projectPath) => {
  //     expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
  //   },
  // },
]

describe('e2e native', () => {
  it.each(projectFilter(TestProjectsEntries))('$name', async (config) => {
    const projectPath = path.resolve(__dirname, '../apps', config.projectPath)
    const testMethod = config.testMethod
    const root = path.resolve(__dirname, '../apps', config.name)
    await deleteAsync([path.resolve(root, 'node_modules/.cache')])
    await twExtract(root)
    const json = await fs.readFile(path.resolve(root, '.tw-patch/tw-class-list.json'), 'utf8')
    expect(json).toMatchSnapshot('json')

    if (config.skipOpenAutomator) {
      await testMethod(null, projectPath)
      return
    }
    const miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath,
    })
    const page = await miniProgram.reLaunch(config.url ?? '/pages/index/index')

    if (page) {
      await testMethod(page, projectPath)
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

        expect(wxml).toMatchSnapshot('wxml')
      }

      await page.waitFor(3000)
    }

    await miniProgram.close()
    await wait()
  })
})
