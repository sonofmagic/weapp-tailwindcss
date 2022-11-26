import automator from 'miniprogram-automator'
// import { expect } from '@jest/globals'
import path from 'path'

const TestProjectsMap = {
  'uni-app-vue2-cli4': {
    projectPath: 'uni-app/dist/build/mp-weixin',
    testMethod: () => {}
  },
  'uni-app-vue2-cli5': {
    projectPath: 'uni-app-webpack5/dist/build/mp-weixin',
    testMethod: () => {}
  },
  'uni-app-vue3-vite': {
    projectPath: 'uni-app-vue3-vite/dist/build/mp-weixin',
    testMethod: () => {}
  },
  'taro-react': {
    projectPath: 'taro-app',
    testMethod: () => {}
  },
  'taro-vue3': {
    projectPath: 'taro-vue3-app',
    testMethod: () => {}
  },
  'taro-vue2': {
    projectPath: 'taro-vue2-app',
    testMethod: () => {}
  },
  'mpx-app': {
    projectPath: 'mpx-app/dist/wx',
    testMethod: () => {}
  },
  'native-mina': {
    projectPath: 'native-mina',
    testMethod: () => {}
  },
  'rax-app': {
    projectPath: 'rax-app/build/wechat-miniprogram',
    testMethod: () => {}
  },
  'remax-app': {
    projectPath: 'remax-app',
    testMethod: () => {}
  }
}

export async function runE2E() {
  const cwd = process.cwd()
  const TestProjectsEntries = Object.entries(TestProjectsMap)
  const projectPaths = TestProjectsEntries.map(([k, v]) => {
    return path.resolve(cwd, 'demo', v.projectPath)
  })
  for (let index = 0; index < projectPaths.length; index++) {
    const projectPath = projectPaths[index]
    const projectName = TestProjectsEntries[index][0]
    const testMethod = TestProjectsEntries[index][1].testMethod
    const miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath
    })
    const page = await miniProgram.reLaunch('/pages/index/index')
    if (page) {
      await testMethod()
      console.log(projectName)
      await page.waitFor(10_000)

      // const element = await page.$('.kind-list-item-hd')
      // console.log(await element.attribute('class'))
      // await element.tap()
    }

    await miniProgram.close()
  }
}
