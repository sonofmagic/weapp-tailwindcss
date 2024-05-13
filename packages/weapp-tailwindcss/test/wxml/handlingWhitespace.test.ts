import { templateHandler } from '#test/v2/wxml'

describe('handling whitespace', () => {
  it('grid grid-cols-[1fr_500px_2fr]', () => {
    expect(
      templateHandler(`<div class="grid grid-cols-[1fr_500px_2fr]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('bg-[url(\'/what_a_rush.png\')]', () => {
    expect(
      templateHandler(`<div class="bg-[url('/what_a_rush.png')]">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })

  it('before:content-[\'hello_world\']', () => {
    expect(
      templateHandler(`<div class="before:content-['hello\_world']">
      <!-- ... -->
    </div>`),
    ).toMatchSnapshot()
  })
})
