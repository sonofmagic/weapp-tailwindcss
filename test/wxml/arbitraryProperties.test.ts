import { templeteHandler } from '@/wxml/index'
// import { format } from '../util'

describe('arbitrary properties', () => {
  test('[mask-type:luminance]', () => {
    expect(
      templeteHandler(`<div class="[mask-type:luminance]">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })

  test('[mask-type:luminance] hover:[mask-type:alpha]', () => {
    expect(
      templeteHandler(`<div class="[mask-type:luminance] hover:[mask-type:alpha]">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })

  test('[--scroll-offset:56px] lg:[--scroll-offset:44px]', () => {
    expect(
      templeteHandler(`<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })
})
