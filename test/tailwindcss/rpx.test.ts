import { getCss } from '../helpers/getTwCss'

describe('rpx', () => {
  it('rpx case 0', async () => {
    const { css } = await getCss([
      'p-[0.32rpx]',
      'm-[23.43rpx]',
      'space-y-[12.0rpx]',
      'w-[12rpx]',
      'min-w-[12rpx]',
      'max-w-[12rpx]',
      'h-[12rpx]',
      'min-h-[12rpx]',
      'max-h-[12rpx]',
      'basis-[32rpx]',
      'text-[32rpx]'
    ])
    expect(css).toMatchSnapshot()
  })
})
