// import fs from 'fs-extra'
// import path from 'pathe'
import { createStyleHandler } from '@/index'

// function getFixture(name: string) {
//   return fs.readFile(
//     path.resolve(__dirname, `./fixtures/css/nutui/${name}`),
//     'utf8',
//   )
// }

describe('@nutui/nutui-react-taro', () => {
  const h = createStyleHandler({
    isMainChunk: true,
    cssCalc: true,
    cssPresetEnv: {
      features: {
        'custom-properties': false,
      },
    },
  })
  it('should ', async () => {
    const { css } = await h(`.a{
background:linear-gradient(90deg,var(--nutui-color-primary-stop-1,#ff475d) 0,var(--nutui-color-primary-stop-2,#ff0f23) 100%);
    }`)

    expect(css).toMatchSnapshot()
  })

  const cssCodes = [
    // `.nut-skeleton-animation{background:linear-gradient(90deg,#0000,#00000005,#0000)}`,
    `.nut-calendar-footer .calendar-confirm-btn{border-radius:var(--nutui-radius-base, 16rpx);background:linear-gradient(90deg,var(--nutui-color-primary-stop-1, #ff475d) 0%,var(--nutui-color-primary-stop-2, #ff0f23) 100%);color:#fff;font-weight:var(--nutui-font-weight-bold, 600)}`,
    `.nut-button-primary-solid{background:linear-gradient(90deg,var(--nutui-color-primary-stop-1, #ff475d) 0%,var(--nutui-color-primary-stop-2, #ff0f23) 100%);color:var(--nutui-button-primary-color, #ffffff);border-color:transparent;font-weight:var(--nutui-font-weight-bold, 600)}`,
    `.nut-address-footer-btn{background:linear-gradient(90deg,var(--nutui-color-primary-stop-1, #ff475d) 0%,var(--nutui-color-primary-stop-2, #ff0f23) 100%);}`,
  ]

  const cssResultCodes = [
    // '.nut-skeleton-animation{background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,0.01961),rgba(0,0,0,0))}',
    /// / `.nut-skeleton-animation{background:linear-gradient(90deg,#0000,#00000005,#0000)}`,
    `.nut-calendar-footer .calendar-confirm-btn{border-radius:16rpx;background:linear-gradient(90deg,#ff475d 0%,#ff0f23 100%);color:#fff;font-weight:600}`,
    `.nut-button-primary-solid{background:linear-gradient(90deg,#ff475d 0%,#ff0f23 100%);color:#ffffff;border-color:transparent;font-weight:600}`,
    `.nut-address-footer-btn{background:linear-gradient(90deg,#ff475d 0%,#ff0f23 100%);}`,
  ]

  it.skip.each(cssCodes.map((x, idx) => {
    return [
      x,
      cssResultCodes[idx],
    ]
  }))('should %s', async (code, expected) => {
    const { css } = await h(code)
    expect(css).toBe(expected)
  })

  it.each(cssCodes.map((x, idx) => {
    return [
      x,
      cssResultCodes[idx],
    ]
  }))('should %s', async (code) => {
    const { css } = await h(code)
    expect(css).toBe(code)
  })

  // it('style', async () => {
  //   const code = await getFixture('style.css')
  // })
})
