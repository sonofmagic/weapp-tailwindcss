import type { ProjectEntry } from './shared'
import fs from 'node:fs/promises'
// import { execa } from 'execa'
import { deleteAsync } from 'del'
import automator from 'miniprogram-automator'
import path from 'pathe'
import { formatWxml, loadCss, projectFilter, removeWxmlId, twExtract, wait } from './shared'

const TestProjectsEntries: ProjectEntry[] = [
  {
    name: 'uni-app',
    projectPath: 'uni-app/dist/build/mp-weixin',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'common/main.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'uni-app-webpack5',
    projectPath: 'uni-app-webpack5/dist/build/mp-weixin',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'common/main.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'uni-app-vue3-vite',
    projectPath: 'uni-app-vue3-vite/dist/build/mp-weixin',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'app.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'taro-app',
    projectPath: 'taro-app',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'taro-app-vite',
    projectPath: 'taro-app-vite',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'taro-vue3-app',
    projectPath: 'taro-vue3-app',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'taro-vue2-app',
    projectPath: 'taro-vue2-app',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'gulp-app',
    projectPath: 'gulp-app',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'mpx-app',
    projectPath: 'mpx-app/dist/wx',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'app.wxss'))).toMatchSnapshot('css')
    },
    url: '/pages/index',
  },
  {
    name: 'native-mina',
    projectPath: 'native-mina',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'dist/app.wxss'))).toMatchSnapshot('css')
    },
  },
  {
    name: 'rax-app',
    projectPath: 'rax-app/build/wechat-miniprogram',
    testMethod: async (_, projectPath) => {
      expect(await loadCss(path.resolve(projectPath, 'bundle.wxss'))).toMatchSnapshot('css')
    },
  },
]

describe('e2e', () => {
  it.each(projectFilter(TestProjectsEntries))('$name', async (config) => {
    const projectPath = path.resolve(__dirname, '../demo', config.projectPath)
    const testMethod = config.testMethod
    const miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath,
    })
    const page = await miniProgram.reLaunch(config.url ?? '/pages/index/index')
    const root = path.resolve(__dirname, '../demo', config.name)
    await deleteAsync([path.resolve(root, 'node_modules/.cache')])
    await twExtract(root)
    const json = await fs.readFile(path.resolve(root, '.tw-patch/tw-class-list.json'), 'utf8')
    expect(json).toMatchSnapshot('json')
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
