// import { expect } from '@jest/globals'
import fs from 'node:fs'
import path from 'node:path'
import automator from 'miniprogram-automator'
import { expect, test, describe } from 'vitest'
const TestProjectsEntries: {
  name: string
  projectPath: string
  // eslint-disable-next-line @typescript-eslint/ban-types
  testMethod: Function
  url?: string
}[] = [
    {
      name: 'uni-app',
      projectPath: 'uni-app/dist/build/mp-weixin',
      testMethod: () => {}
    },
    {
      name: 'uni-app-vue2-cli5',
      projectPath: 'uni-app-webpack5/dist/build/mp-weixin',
      testMethod: () => {}
    },
    {
      name: 'uni-app-vue3-vite',
      projectPath: 'uni-app-vue3-vite/dist/build/mp-weixin',
      testMethod: () => {}
    },
    {
      name: 'taro-react',
      projectPath: 'taro-app',
      testMethod: () => {}
    },
    {
      name: 'taro-vue3',
      projectPath: 'taro-vue3-app',
      testMethod: () => {}
    },
    {
      name: 'taro-vue2',
      projectPath: 'taro-vue2-app',
      testMethod: () => {}
    },
    {
      name: 'gulp-app',
      projectPath: 'gulp-app',
      testMethod: () => {}
    },
    {
      name: 'mpx-app',
      projectPath: 'mpx-app/dist/wx',
      testMethod: () => {},
      url: '/pages/index'
    },
    {
      name: 'native-mina',
      projectPath: 'native-mina',
      testMethod: () => {}
    },
    {
      name: 'rax-app',
      projectPath: 'rax-app/build/wechat-miniprogram',
      testMethod: () => {}
    }
  ]

function wait(ts = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, ts)
  })
}

describe('e2e', () => {
  test.only.each(TestProjectsEntries)('$name', async (config) => {
    const projectPath = path.resolve(__dirname, '../demo', config.projectPath)
    const testMethod = config.testMethod
    const miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath
    })
    const page = await miniProgram.reLaunch(config.url ?? '/pages/index/index')
    if (page) {
      await testMethod(page)
      const pageEl = await page.$('page')
      const wxml = await pageEl?.wxml()
      expect(wxml).toMatchSnapshot()
      await page.waitFor(3000)
    }

    await miniProgram.close()
    await wait()
  });
})
