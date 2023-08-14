/**
 * @file e2e test example
 * 首先开启工具安全设置中的 CLI/HTTP 调用功能
 * docs of miniprogram-automator: https://developers.weixin.qq.com/miniprogram/dev/devtools/auto/quick-start.html
 */
import automator from '@mpxjs/e2e'

describe('index', () => {
  let miniProgram: any
  let page: any

  beforeAll(async () => {
    try {
      miniProgram = await automator.connect({ wsEndpoint: 'ws://localhost:9420' })
    } catch (e) {
      miniProgram = await automator.launch({
        projectPath: './dist/wx'
      })
    }
    page = await miniProgram.reLaunch('/pages/index')
    await page.waitFor(500)
  }, 30000)

  it('desc', async () => {
    const desc = await page.$('list', 'components/list2271575d/index')
    // 断言页面标签
    expect(desc.tagName).toBe('view')
    // 断言文字内容
    expect(await desc.text()).toContain('手机')
    // 保存页面快照
    await miniProgram.screenshot({
      path: 'e2e/screenshot/homePage.png'
    })
  })

  afterAll(async () => {
    await miniProgram.close()
  })
})
