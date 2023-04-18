import { splitCode } from '@/extractors/split'

it('extractorSplit', () => {
  let code = ''
  let arr = []
  function extract() {
    return [...(splitCode(code) || [])]
  }

  code = 'foo'
  expect(extract()).toEqual(['foo'])

  code = '<div class="text-red border">foo</div>'
  expect(extract()).toContain('text-red')

  code = '<div class="<sm:text-lg">foo</div>'
  expect(extract()).toContain('<sm:text-lg')

  code = '"class="bg-white""'
  expect(extract()).toContain('bg-white')
  // Using arbitrary values
  code = '<div class="top-[117px]">'
  expect(extract()).toContain('top-[117px]')

  code = '<div class="top-[117px] lg:top-[344px]">'
  arr = extract()
  expect(extract()).toContain('top-[117px]')
  expect(arr).toContain('lg:top-[344px]')

  code = '<div class="bg-[#bada55] text-[22px] before:content-[\'Festivus\']">'
  arr = extract()
  expect(arr).toContain('bg-[#bada55]')
  expect(arr).toContain('text-[22px]')
  expect(arr).toContain("before:content-['Festivus']")

  code = '<div class="grid grid-cols-[fit-content(theme(spacing.32))]">'
  arr = extract()
  expect(arr).toContain('grid')
  expect(arr).toContain('grid-cols-[fit-content(theme(spacing.32))]')

  code = '<div class="bg-[--my-color]">'
  arr = extract()
  expect(arr).toContain('bg-[--my-color]')
  // Arbitrary properties
  code = '<div class="[mask-type:luminance]">'
  arr = extract()
  expect(arr).toContain('[mask-type:luminance]')

  code = '<div class="[mask-type:luminance] hover:[mask-type:alpha]">'
  arr = extract()
  expect(arr).toContain('[mask-type:luminance]')
  expect(arr).toContain('hover:[mask-type:alpha]')

  code = '<div class="[--scroll-offset:56px] lg:[--scroll-offset:44px]">'
  arr = extract()
  expect(arr).toContain('[--scroll-offset:56px]')
  expect(arr).toContain('lg:[--scroll-offset:44px]')
  // Arbitrary variants
  code = '<li class="lg:[&:nth-child(3)]:hover:underline">{item}</li>'
  arr = extract()
  expect(arr).toContain('lg:[&:nth-child(3)]:hover:underline')
  // Handling whitespace
  code = '<div class="grid grid-cols-[1fr_500px_2fr]">'
  arr = extract()
  expect(arr).toContain('grid')
  expect(arr).toContain('grid-cols-[1fr_500px_2fr]')

  code = '<div class="bg-[url(\'/what_a_rush.png\')]">'
  arr = extract()
  expect(arr).toContain("bg-[url('/what_a_rush.png')]")

  code = '<div class="before:content-[\'hello_world\']">'
  arr = extract()
  expect(arr).toContain("before:content-['hello_world']")

  // code = "<div className={String.raw`before:content-['hello_world']`}>"
  // arr = extract()
  // expect(arr).toContain("before:content-['hello_world']")
})
