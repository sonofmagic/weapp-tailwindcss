import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import supportCustomUnit from '../src/index'
describe('tailwindcss-support-custom-unit', () => {
  async function getCss(content: string[], testPlugin = true) {
    const processor = postcss([
      tailwindcss({
        content: content.map((x) => {
          return {
            raw: x
          }
        }),
        plugins: [
          testPlugin
            ? supportCustomUnit({
                unit: 'rpx'
              })
            : undefined
        ].filter((x) => x)
      })
    ])
    return await processor.process('@tailwind utilities;', {
      from: 'index.css',
      to: 'index.css'
    })
  }

  it('common case', async () => {
    const testCase = `<view class="w-[77rpx] h-[77rpx] text-[17rpx] border-[7rpx] p-[5rpx] m-[5rpx] space-y-[11rpx]">
    <view class="leading-[23rpx] rounded-[12rpx]">1</view>
    <view class="underline-offset-[3rpx]">2</view>
    <view class="indent-[11rpx] border-t-[3rpx]">3</view>
    <view class="divide-[3rpx] divide-x-[3px]">4</view>
    <view class="outline-[5rpx] outline-offset-[3rpx]">5</view>
    <view class="ring-[10rpx] ring-offset-[3rpx]">6</view>
    <view class="origin-[100rpx_111rpx]">6</view>
    <view class="translate-y-[17rpx] backdrop-blur-[2rpx] blur-[2rpx]"></view>
  </view>`

    const { css } = await getCss([testCase])
    // 我写的里面是不包含任何的color的
    expect(css).not.toContain('color')
    expect(css).toMatchSnapshot()
  })

  it('text case without plugin', async () => {
    const { css } = await getCss(['text-[17rpx]'], false)
    expect(css).toContain('color')
    expect(css).toBeTruthy()
  })

  it('text rpx case with plugin 0', async () => {
    const { css } = await getCss(['text-[17rpx]'])
    expect(css).toBeTruthy()
  })

  it('text px cases with or without plugin are same', async () => {
    const { css: css0 } = await getCss(['text-[17px]'])
    const { css: css1 } = await getCss(['text-[17px]'], false)
    expect(css0).toBe(css1)
  })

  it('tab case', async () => {
    const { css } = await getCss(['tab-[17rpx] tab-[17]'])
    expect(css).toBeTruthy()
  })
})
