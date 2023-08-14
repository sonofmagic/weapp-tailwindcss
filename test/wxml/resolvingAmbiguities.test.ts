import { templateHandler } from '#test/v2/wxml'

describe('resolving ambiguities', () => {
  test('text-[22px]', () => {
    expect(templateHandler('<div class="text-[22px]">...</div>')).toMatchSnapshot()
  })

  test('text-[#bada55]', () => {
    expect(templateHandler('<div class="text-[#bada55]">...</div>')).toMatchSnapshot()
  })

  test('text-[var(--my-var)]', () => {
    expect(templateHandler('<div class="text-[var(--my-var)]">...</div>')).toMatchSnapshot()
  })

  test('text-[length:var(--my-var)]', () => {
    expect(templateHandler('<div class="text-[length:var(--my-var)]">...</div>')).toMatchSnapshot()
  })

  test('text-[color:var(--my-var)]', () => {
    expect(templateHandler('<div class="text-[color:var(--my-var)]">...</div>')).toMatchSnapshot()
  })
})
