import { getCss } from '../helpers/getTwCss'

describe('rpx', () => {
  it('rpx case 0', async () => {
    const { css } = await getCss([
      // flexbox and grid
      'basis-[32rpx]',
      'grid-cols-[200rpx_minmax(900rpx,_1fr)_100rpx]',
      'gap-[2.75rpx]',
      // spacing
      'p-[0.32rpx]',
      'm-[23.43rpx]',
      'space-y-[12.0rpx]',
      // sizing
      'w-[12rpx]',
      'min-w-[12rpx]',
      'max-w-[12rpx]',
      'h-[12rpx]',
      'min-h-[12rpx]',
      'max-h-[12rpx]',
      // Typography
      'text-[32rpx]',
      'text-[#fafafa]',
      'text-[length:32rpx]',
      'text-[color:32rpx]',
      'tracking-[.25rpx]',
      'leading-[3rpx]',
      'decoration-[3rpx]',
      'underline-offset-[3rpx]',
      'indent-[50rpx]',
      // Backgrounds
      'bg-[center_top_1rpx]',
      'bg-[length:200rpx_100rpx]',
      // Borders
      'rounded-[12rpx]',
      'border-t-[3rpx]',
      'divide-x-[3rpx]',
      'outline-[5rpx]',
      'ring-[10rpx]',
      'ring-offset-[3rpx]',
      // Effects
      'shadow-[0_35rpx_60rx_-15px_rgba(0,0,0,0.3)]',
      // Transforms
      'translate-y-[17rpx]'
    ])
    expect(css).toMatchSnapshot()
  })
})
