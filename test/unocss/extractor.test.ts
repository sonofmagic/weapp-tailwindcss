import { splitCode } from '@/extractors/split'

it('extractorSplit', () => {
  let code = ''
  function extract() {
    return [...(splitCode(code) || [])]
  }

  code = 'foo'
  expect(extract()).toEqual(['foo'])

  // code = '<div class="text-red border">foo</div>'
  // expect(extract()).toContain('text-red')

  // code = '<div class="<sm:text-lg">foo</div>'
  // expect(extract()).toContain('<sm:text-lg')

  // code = '"class="bg-white""'
  // expect(extract()).toContain('bg-white')
})
