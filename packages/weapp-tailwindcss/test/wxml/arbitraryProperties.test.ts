import { getCompilerContext } from '@/context'

describe('arbitrary properties', () => {
  it('[mask-type:luminance]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="[mask-type:luminance]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('[mask-type:luminance] hover:[mask-type:alpha]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="[mask-type:luminance] hover:[mask-type:alpha]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('[--scroll-offset:56px] lg:[--scroll-offset:44px]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })
})
