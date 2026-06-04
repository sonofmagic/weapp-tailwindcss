import { getCompilerContext } from '@/context'

describe('handling whitespace', () => {
  it('grid grid-cols-[1fr_500px_2fr]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="grid grid-cols-[1fr_500px_2fr]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('bg-[url(\'/what_a_rush.png\')]', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="bg-[url('/what_a_rush.png')]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('before:content-[\'hello_world\']', async () => {
    const { templateHandler } = getCompilerContext()
    expect(
      await templateHandler(`<div class="before:content-['hello\_world']">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })
})
