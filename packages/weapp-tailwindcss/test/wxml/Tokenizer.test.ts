import { TokenizerStateMachine } from '@/wxml/Tokenizer'

describe('tokenizerStateMachine', () => {
  it('should tokenize a string with spaces and text correctly', () => {
    const inputString = '2xl:text-xs rd-tag-{{type}}-{{theme}} {{prefix}}-btn'
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['2xl:text-xs', 'rd-tag-{{type}}-{{theme}}', '{{prefix}}-btn'])
  })

  it('should handle leading and trailing spaces', () => {
    const inputString = '  2xl:text-xs  '
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['2xl:text-xs'])
  })

  it('should handle multiple spaces between tokens', () => {
    const inputString = '2xl:text-xs   rd-tag-{{type}}  '
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['2xl:text-xs', 'rd-tag-{{type}}'])
  })

  it('should handle empty string', () => {
    const inputString = ''
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual([])
  })

  it('should handle strings with only spaces', () => {
    const inputString = '     '
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual([])
  })

  it('should handle single token without spaces', () => {
    const inputString = '2xl:text-xs'
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['2xl:text-xs'])
  })

  it('should handle multiple tokens without spaces', () => {
    const inputString = '2xl:text-xsrd-tag-{{type}}'
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['2xl:text-xsrd-tag-{{type}}'])
  })

  it('should handle nested braces correctly', () => {
    const inputString = 'rd-tag-{{type}}-{{nested-{{inner}}}}'
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['rd-tag-{{type}}-{{nested-{{inner}}}}'])
  })

  it('should handle braces with spaces inside', () => {
    const inputString = 'class-{{ some value }}-modifier'
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['class-{{ some value }}-modifier'])
  })

  it('should handle braces with JS expressions inside', () => {
    const inputString = 'result-{{ 2 + 2 }}-final'
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['result-{{ 2 + 2 }}-final'])
  })

  it('should handle multiple braces with complex expressions', () => {
    const inputString = 'prefix-{{ someValue }}-mid-{{ another + value }}-suffix'
    const tokenizer = new TokenizerStateMachine()
    const result = tokenizer.run(inputString)
    expect(result).toEqual(['prefix-{{ someValue }}-mid-{{ another + value }}-suffix'])
  })
})
