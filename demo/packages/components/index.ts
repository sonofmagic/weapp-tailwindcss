import automator from 'miniprogram-automator'
// import { expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'

const TestProjectsEntries: {
  name: string
  projectPath: string
  testMethod: Function
  url?: string
}[] = [
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

function mkcache(projectName: string, cb: (json: any) => void) {
  const p = path.resolve(__dirname, './.task.json')
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8')
    const taskMap = JSON.parse(content)
    cb(taskMap)
    taskMap[projectName] = 1
    fs.writeFileSync(p, JSON.stringify(taskMap, null, 2), 'utf-8')
  } else {
    fs.writeFileSync(p, JSON.stringify({ [projectName]: 1 }, null, 2), 'utf-8')
  }
}

export async function runE2E() {
  const cwd = process.cwd()
  const projectPaths = TestProjectsEntries.map((item) => {
    return path.resolve(cwd, 'demo', item.projectPath)
  })
  for (let index = 0; index < projectPaths.length; index++) {
    const projectPath = projectPaths[index]
    const config = TestProjectsEntries[index]
    const projectName = config.name
    const testMethod = config.testMethod
    const miniProgram = await automator.launch({
      // cliPath: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      projectPath
    })
    const page = await miniProgram.reLaunch(config.url ?? '/pages/index/index')
    if (page) {
      await testMethod()
      console.log(projectName)
      await page.waitFor(10_000)

      // const element = await page.$('.kind-list-item-hd')
      // console.log(await element.attribute('class'))
      // await element.tap()
    }

    await miniProgram.close()
    await wait()
  }
}
