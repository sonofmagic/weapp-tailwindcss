import { templateHandler } from '@/wxml/index'
// import { format } from '../util'

describe('arbitrary values', () => {
  test('top-[117px]', () => {
    expect(
      templateHandler(`<div class="top-[117px]">
    <!-- ... -->
  </div>`)
    ).toMatchSnapshot()
  })

  test('top-[117px] lg:top-[344px]', () => {
    expect(
      templateHandler(`<div class="top-[117px] lg:top-[344px]">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })

  test("bg-[#bada55] text-[22px] before:content-['Festivus']", () => {
    expect(
      templateHandler(`<div class="bg-[#bada55] text-[22px] before:content-['Festivus']">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })
})
