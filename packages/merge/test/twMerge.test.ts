import { escape as escapeClassName } from '@weapp-core/escape'
import { create as createCva, cva } from '@/cva'
import {
  create as createV3,
  tailwindMergeVersion as tailwindMergeV3Version,
  twMerge,
} from '@/v3'
import {
  tailwindMergeVersion as tailwindMergeV4Version,
  twMerge as twMergeV4,
} from '@/v4'

describe('v3', () => {
  it('merges tailwind classes and escapes the output', () => {
    expect(twMerge('p-1 p-2 p-0.5')).toBe('p-0_d5')
    expect(twMerge('text-[34px]', 'text-[#ececec]')).toBe('text-_b34px_B text-_b_hececec_B')
    expect(twMerge('text-[34px]', 'text-[#ECECEC]')).toBe('text-_b34px_B text-_b_hECECEC_B')
    expect(twMergeV4('text-[34px]', 'text-[#ECECEC]')).toBe('text-_b34px_B text-_b_hECECEC_B')
    expect(twMerge('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')).toBe('p-0_d5 text-_b34px_B text-_b_hececec_B')
    expect(twMergeV4('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')).toBe('p-0_d5 text-_b34px_B text-_b_hececec_B')
  })

  it('normalizes already escaped class tokens before merging', () => {
    expect(twMerge('text-_b_hececec_B', 'text-[#ececec]')).toBe('text-_b_hececec_B')
    expect(twMerge('text-_b_hECECEC_B', 'text-_b_hececec_B')).toBe('text-_b_hececec_B')
    expect(twMergeV4('text-_b_hececec_B', 'text-[#ECECEC]')).toBe('text-_b_hECECEC_B')
  })
})

describe('factory options', () => {
  it('can disable final escaping while keeping unescape enabled', () => {
    const { twMerge: rawMerge } = createV3({ escape: false })

    expect(rawMerge('text-[#ECECEC]')).toBe('text-[#ECECEC]')
    expect(rawMerge('text-_b_hececec_B')).toBe('text-[#ececec]')
  })

  it('can disable unescape to opt out of normalization', () => {
    const { twMerge: strictMerge } = createV3({ unescape: false })

    expect(strictMerge('text-_b_hececec_B', 'text-[#ececec]')).toBe('text-_b_hececec_B')
  })

  it('can disable both escape and unescape for complete pass-through', () => {
    const { twMerge: passthrough } = createV3({ escape: false, unescape: false })

    expect(passthrough('text-_b_hececec_B', 'text-[#ececec]')).toBe('text-[#ececec]')
  })
})

describe('merge behavior reference', () => {
  const merge = twMergeV4
  const esc = (value: string) => escapeClassName(value)

  it('honours last conflicting class wins', () => {
    expect(merge('p-5 p-2 p-4')).toBe('p-4')
    expect(merge('w-[10rpx]', 'w-[24rpx]')).toBe(esc('w-[24rpx]'))
  })

  it('allows refinements without conflicts', () => {
    expect(merge('p-3 px-5')).toBe('p-3 px-5')
    expect(merge('inset-x-4 right-4')).toBe('inset-x-4 right-4')
    expect(merge('p-[12rpx]', 'px-5')).toBe(esc('p-[12rpx] px-5'))
    expect(merge('inset-x-[12rpx]', 'right-[6rpx]')).toBe(esc('inset-x-[12rpx] right-[6rpx]'))
  })

  it('resolves non-trivial conflicts', () => {
    expect(merge('inset-x-px -inset-1')).toBe('-inset-1')
    expect(merge('bottom-auto inset-y-6')).toBe('inset-y-6')
    expect(merge('inline block')).toBe('block')
    expect(merge('inset-x-[12rpx]', '-inset-[1rpx]')).toBe(esc('-inset-[1rpx]'))
    expect(merge('bottom-auto inset-y-[24rpx]')).toBe(esc('inset-y-[24rpx]'))
  })

  it('supports modifiers and stacked modifiers', () => {
    expect(merge('p-2 hover:p-4')).toBe(esc('p-2 hover:p-4'))
    expect(merge('hover:p-2 hover:p-4')).toBe(esc('hover:p-4'))
    expect(merge('hover:focus:p-2 focus:hover:p-4')).toBe(esc('focus:hover:p-4'))
    expect(merge('hover:w-[10rpx]', 'hover:w-[16rpx]')).toBe(esc('hover:w-[16rpx]'))
    expect(merge('hover:focus:w-[12rpx]', 'focus:hover:w-[16rpx]')).toBe(esc('focus:hover:w-[16rpx]'))
  })

  it('supports arbitrary values including mini-program units', () => {
    expect(merge('bg-black bg-(--my-color) bg-[color:var(--mystery-var)]')).toBe(
      esc('bg-[color:var(--mystery-var)]'),
    )
    expect(merge('grid-cols-[1fr,auto] grid-cols-2')).toBe('grid-cols-2')
    expect(merge('text-[length:32rpx]', 'text-[length:24rpx]')).toBe(esc('text-[length:24rpx]'))
  })

  it('supports arbitrary properties', () => {
    expect(merge('[mask-type:luminance] [mask-type:alpha]')).toBe(esc('[mask-type:alpha]'))
    expect(merge('[--scroll-offset:56px] lg:[--scroll-offset:44px]')).toBe(
      esc('[--scroll-offset:56px] lg:[--scroll-offset:44px]'),
    )
    expect(merge('[padding:20rpx]', '[padding:24rpx]')).toBe(esc('[padding:24rpx]'))
    expect(merge('[padding:20rpx]', 'p-8')).toBe(esc('[padding:20rpx] p-8'))
  })

  it('supports arbitrary variants', () => {
    expect(merge('[&:nth-child(3)]:py-0 [&:nth-child(3)]:py-4')).toBe(esc('[&:nth-child(3)]:py-4'))
    expect(
      merge('dark:hover:[&:nth-child(3)]:py-0 hover:dark:[&:nth-child(3)]:py-4'),
    ).toBe(esc('hover:dark:[&:nth-child(3)]:py-4'))
    expect(merge('[&_view]:p-[12rpx]', '[&_view]:p-[16rpx]')).toBe(esc('[&_view]:p-[16rpx]'))
    expect(merge('[&_view]:p-[12rpx]', 'focus:[&_view]:p-4')).toBe(
      esc('[&_view]:p-[12rpx] focus:[&_view]:p-4'),
    )
  })

  it('supports important modifiers', () => {
    expect(merge('p-3! p-4! p-5')).toBe(esc('p-4! p-5'))
    expect(merge('right-2! -inset-x-1!')).toBe(esc('-inset-x-1!'))
    expect(merge('w-[12rpx]!', 'w-[24rpx]!', 'w-[10rpx]')).toBe(esc('w-[24rpx]! w-[10rpx]'))
  })

  it('supports postfix modifiers', () => {
    expect(merge('text-sm leading-6 text-lg/7')).toBe(esc('text-lg/7'))
    expect(merge('text-sm leading-6 text-[length:28rpx]/7')).toBe(esc('text-[length:28rpx]/7'))
  })

  it('preserves non-tailwind classes', () => {
    expect(merge('p-5 p-2 my-non-tailwind-class p-4')).toBe('my-non-tailwind-class p-4')
    expect(merge('p-[12rpx]', 'mina-card', 'p-[16rpx]')).toBe(`mina-card ${esc('p-[16rpx]')}`)
  })

  it('supports custom colors out of the box', () => {
    expect(merge('text-red text-secret-sauce')).toBe('text-secret-sauce')
    expect(merge('text-[#123456]', 'text-[#654321]')).toBe(esc('text-[#654321]'))
  })

  it('supports multiple arguments', () => {
    expect(merge('some-class', 'another-class yet-another-class', 'so-many-classes')).toBe(
      'some-class another-class yet-another-class so-many-classes',
    )
    expect(merge('some-class', 'w-[12rpx]', 'w-[24rpx]')).toBe(`some-class ${esc('w-[24rpx]')}`)
  })

  it('supports conditional classes', () => {
    expect(merge('some-class', undefined, null, false, 0)).toBe('some-class')
    expect(
      merge('my-class', false && 'not-this', null && 'also-not-this', true && 'but-this'),
    ).toBe('my-class but-this')
    expect(
      merge('foo', false && 'w-[12rpx]', null && 'skip', true && 'w-[16rpx]'),
    ).toBe(`foo ${esc('w-[16rpx]')}`)
  })

  it('supports arrays and nested arrays', () => {
    expect(merge('some-class', [undefined, ['another-class', false]], ['third-class'])).toBe(
      'some-class another-class third-class',
    )
    expect(merge('hi', true && ['hello', ['hey', false]], false && ['bye'])).toBe('hi hello hey')
    expect(merge('hi', ['w-[12rpx]', ['w-[24rpx]']])).toBe(`hi ${esc('w-[24rpx]')}`)
  })
})

describe('version metadata', () => {
  it('exposes tailwind-merge major version numbers', () => {
    expect(tailwindMergeV3Version).toBe(2)
    expect(tailwindMergeV4Version).toBe(3)
  })
})

describe('cva integration', () => {
  it('applies escaping by default', () => {
    const button = cva('text-[#ECECEC]')

    expect(button()).toBe('text-_b_hECECEC_B')
  })

  it('can disable escaping entirely', () => {
    const { cva: plainCva } = createCva({ escape: false, unescape: false })
    const tag = plainCva('text-[#ECECEC]')

    expect(tag()).toBe('text-[#ECECEC]')
  })
})
