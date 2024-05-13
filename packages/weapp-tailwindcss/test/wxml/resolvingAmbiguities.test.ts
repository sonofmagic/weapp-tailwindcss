import { templateHandler } from '#test/v2/wxml'

describe('resolving ambiguities', () => {
  it('text-[22px]', () => {
    expect(templateHandler('<div class="text-[22px]">...</div>')).toMatchSnapshot()
  })

  it('text-[#bada55]', () => {
    expect(templateHandler('<div class="text-[#bada55]">...</div>')).toMatchSnapshot()
  })

  it('text-[var(--my-var)]', () => {
    expect(templateHandler('<div class="text-[var(--my-var)]">...</div>')).toMatchSnapshot()
  })

  it('text-[length:var(--my-var)]', () => {
    expect(templateHandler('<div class="text-[length:var(--my-var)]">...</div>')).toMatchSnapshot()
  })

  it('text-[color:var(--my-var)]', () => {
    expect(templateHandler('<div class="text-[color:var(--my-var)]">...</div>')).toMatchSnapshot()
  })
})
