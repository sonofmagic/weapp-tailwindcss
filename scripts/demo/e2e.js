const automator = require('miniprogram-automator')
const path = require('path')
const demoDir = [
  'uni-app/dist/build/mp-weixin',
  'uni-app-vue3-vite/dist/build/mp-weixin',
  'taro-app',
  'mpx-app/dist/wx',
  'native-mina',
  'rax-app/build/wechat-miniprogram',
  'remax-app',
  'taro-vue2-app',
  'taro-vue3-app'
]

async function main () {
  const cwd = process.cwd()
  const projectPaths = demoDir.map((x) => {
    return path.resolve(cwd, 'demo', x)
  })
  for (let index = 0; index < projectPaths.length; index++) {
    const projectPath = projectPaths[index]
    await automator
      .launch({
        cliPath: 'D:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
        projectPath
      })
      .then(async (miniProgram) => {
        const page = await miniProgram.reLaunch('/pages/index/index')
        await page.waitFor(10_000)
        // const element = await page.$('.kind-list-item-hd')
        // console.log(await element.attribute('class'))
        // await element.tap()
        await miniProgram.close()
      })
  }
}

main()
