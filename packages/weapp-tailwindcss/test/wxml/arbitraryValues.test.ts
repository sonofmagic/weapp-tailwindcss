import { getCompilerContext } from '@/context'

describe('arbitrary values', () => {
  it('top-[117px]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="top-[117px]">
    <!-- ... -->
  </div>`),
    ).toMatchSnapshot()
  })

  it('top-[117px] lg:top-[344px]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="top-[117px] lg:top-[344px]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('bg-[#bada55] text-[22px] before:content-[\'Festivus\']', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="bg-[#bada55] text-[22px] before:content-['Festivus']">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })
})
