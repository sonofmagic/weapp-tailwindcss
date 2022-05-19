import { templeteHandler } from '@/wxml/index'
// import { format } from '../util'

describe('arbitrary values', () => {
  test('top-[117px]', () => {
    expect(
      templeteHandler(`<div class="top-[117px]">
    <!-- ... -->
  </div>`)
    ).toMatchSnapshot()
  })

  test('top-[117px] lg:top-[344px]', () => {
    expect(
      templeteHandler(`<div class="top-[117px] lg:top-[344px]">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })

  test("bg-[#bada55] text-[22px] before:content-['Festivus']", () => {
    expect(
      templeteHandler(`<div class="bg-[#bada55] text-[22px] before:content-['Festivus']">
      <!-- ... -->
    </div>`)
    ).toMatchSnapshot()
  })
})
