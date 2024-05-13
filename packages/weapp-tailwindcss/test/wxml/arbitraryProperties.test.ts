import { templateHandler } from '#test/v2/wxml'

describe('arbitrary properties', () => {
  it('[mask-type:luminance]', () => {
    expect(
      templateHandler(`<div class="[mask-type:luminance]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('[mask-type:luminance] hover:[mask-type:alpha]', () => {
    expect(
      templateHandler(`<div class="[mask-type:luminance] hover:[mask-type:alpha]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('[--scroll-offset:56px] lg:[--scroll-offset:44px]', () => {
    expect(
      templateHandler(`<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })
})
