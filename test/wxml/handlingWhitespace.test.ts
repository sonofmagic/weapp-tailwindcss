/* eslint-disable no-useless-escape */
import { templateHandler } from '@/wxml/index'
// import { format } from '../util'

describe('handling whitespace', () => {
  test('grid grid-cols-[1fr_500px_2fr]', () => {
    expect(
      templateHandler(`<div class="grid grid-cols-[1fr_500px_2fr]">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })

  test("bg-[url('/what_a_rush.png')]", () => {
    expect(
      templateHandler(`<div class="bg-[url('/what_a_rush.png')]">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })

  test("before:content-['hello_world']", () => {
    expect(
      templateHandler(`<div class="before:content-['hello\_world']">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })
})
