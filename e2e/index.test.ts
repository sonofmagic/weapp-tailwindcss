// import { expect } from '@jest/globals'
import fs from 'node:fs/promises'
import path from 'node:path'
import prettier from 'prettier'
import automator from 'miniprogram-automator'
import { execa } from 'execa'
import { deleteAsync } from 'del'
import type Page from 'miniprogram-automator/out/Page'
import { removeWxmlId } from '../packages/weapp-tailwindcss/test/util'

async function loadCss(p: string) {
  const css = await fs.readFile(p, 'utf8')
  const code = await prettier.format(css, {
    parser: 'css',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
  return code
}

const TestProjectsEntries: {
  name: string
  projectPath: string
  testMethod: (page: Page, b: string) => void
  url?: string
}[] = [
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

function wait(ts = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, ts)
  })
}

describe('e2e', () => {
  it.each(TestProjectsEntries)('$name', async (config) => {
    const projectPath = path.resolve(__dirname, '../demo', config.projectPath)
    const testMethod = config.testMethod
    const miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath,
    })
    const page = await miniProgram.reLaunch(config.url ?? '/pages/index/index')
    const root = path.resolve(__dirname, '../demo', config.name)
    await deleteAsync([path.resolve(root, 'node_modules/.cache')])
    if (page) {
      await testMethod(page, projectPath)
      const pageEl = await page.$('page')
      let wxml = await pageEl?.wxml()
      if (wxml) {
        wxml = removeWxmlId(wxml)
        try {
          wxml = await prettier.format(wxml, {
            parser: 'html',
            tabWidth: 2,
            useTabs: false,
            semi: false,
            singleQuote: true,
            endOfLine: 'lf',
            trailingComma: 'none',
            printWidth: 180,
            bracketSameLine: true,
            htmlWhitespaceSensitivity: 'ignore',
          })
        }
        catch {
          console.error(`parse error: ${config.projectPath}`)
        }

        expect(wxml).toMatchSnapshot()
      }

      await page.waitFor(3000)

      await execa('npx', ['tw-patch', 'extract'], {
        cwd: root,
      })

      const json = await fs.readFile(path.resolve(root, '.tw-patch/tw-class-list.json'), 'utf8')

      expect(json).toMatchSnapshot()
    }

    await miniProgram.close()
    await wait()
  })
})
