import { templeteHandler } from '@/wxml/index'
// import { format } from '../util'

describe('resolving ambiguities', () => {
  test('text-[22px]', () => {
    expect(templeteHandler('<div class="text-[22px]">...</div>')).toMatchSnapshot()
  })

  test('text-[#bada55]', () => {
    expect(templeteHandler('<div class="text-[#bada55]">...</div>')).toMatchSnapshot()
  })

  test('text-[var(--my-var)]', () => {
    expect(templeteHandler('<div class="text-[var(--my-var)]">...</div>')).toMatchSnapshot()
  })

  test('text-[length:var(--my-var)]', () => {
    expect(templeteHandler('<div class="text-[length:var(--my-var)]">...</div>')).toMatchSnapshot()
  })

  test('text-[color:var(--my-var)]', () => {
    expect(templeteHandler('<div class="text-[color:var(--my-var)]">...</div>')).toMatchSnapshot()
  })
})
