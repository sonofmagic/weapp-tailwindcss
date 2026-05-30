import { afterEach, describe, it } from 'vitest'

import { miniProgramCases, uniAppAppCases, uniAppXAppCases, webCases } from './hbuilderx-local/cases'
import { hbuilderxAppTimeoutMs, hbuilderxTimeoutMs, killProcessTree, serverTimeoutMs } from './hbuilderx-local/process'
import { compileMiniProgramWithHBuilderX, verifyAppHmrWithHBuilderX, verifyWebHmr } from './hbuilderx-local/runner'
import { clearDevProcess, getDevProcess } from './hbuilderx-local/web'

const describeLocalHBuilderX = process.env['E2E_HBUILDERX_LOCAL'] === '1' ? describe : describe.skip
const appPlatformFilter = process.env['E2E_HBUILDERX_APP_PLATFORM']
const allAppCases = [...uniAppAppCases, ...uniAppXAppCases]
const appCases = appPlatformFilter
  ? allAppCases.filter(item => item.platform === appPlatformFilter)
  : allAppCases

describeLocalHBuilderX.sequential('HBuilderX demo local e2e', () => {
  afterEach(() => {
    const devProcess = getDevProcess()
    if (devProcess) {
      killProcessTree(devProcess)
      clearDevProcess()
    }
  })

  it.each(miniProgramCases)('用 HBuilderX 编译微信小程序产物：$name', async (item) => {
    await compileMiniProgramWithHBuilderX(item)
  }, hbuilderxTimeoutMs + 30_000)

  it.each(appCases)('验证 HBuilderX uni-app App 开发态热更新产物：$name', async (item) => {
    await verifyAppHmrWithHBuilderX(item)
  }, hbuilderxAppTimeoutMs + 30_000)

  it.each(webCases)('验证 HBuilderX uni-app Web 页面和 HMR：$name', async (item) => {
    await verifyWebHmr(item)
  }, serverTimeoutMs * 2)
})
