import { Tokenizer } from '@/wxml/Tokenizer'
import MagicString from 'magic-string'
import type { Token } from '@/wxml/Tokenizer'

describe('tokenizer', () => {
  it('should tokenize a string with spaces and text correctly', () => {
    const inputString = new MagicString('2xl:text-xs rd-tag-{{type}}-{{theme}} {{prefix}}-btn')
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString.original)
    expect(result).toMatchSnapshot()
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['2xl:text-xs', 'rd-tag-{{type}}-{{theme}}', '{{prefix}}-btn'])

    inputString.update(result[0].start, result[0].end, 'x')
    inputString.update(result[1].start, result[1].end, 'x')
    inputString.update(result[2].start, result[2].end, 'x')
    expect(inputString.toString()).toBe('x x x')
  })

  it('should handle leading and trailing spaces', () => {
    const inputString = new MagicString('  2xl:text-xs  ')
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString.original)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['2xl:text-xs'])
    inputString.update(result[0].start, result[0].end, 'x')
    expect(inputString.toString()).toBe('  x  ')
  })

  it('should handle multiple spaces between tokens', () => {
    const inputString = '2xl:text-xs   rd-tag-{{type}}  '
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['2xl:text-xs', 'rd-tag-{{type}}'])
  })

  it('should handle empty string', () => {
    const inputString = ''
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual([])
  })

  it('should handle strings with only spaces', () => {
    const inputString = '     '
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual([])
  })

  it('should handle single token without spaces', () => {
    const inputString = '2xl:text-xs'
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['2xl:text-xs'])
  })

  it('should handle multiple tokens without spaces', () => {
    const inputString = '2xl:text-xsrd-tag-{{type}}'
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['2xl:text-xsrd-tag-{{type}}'])
  })

  it('should handle nested braces correctly', () => {
    const inputString = 'rd-tag-{{type}}-{{nested-{{inner}}}}'
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['rd-tag-{{type}}-{{nested-{{inner}}}}'])
  })

  it('should handle braces with spaces inside', () => {
    const inputString = 'class-{{ some value }}-modifier'
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['class-{{ some value }}-modifier'])
  })

  it('should handle braces with JS expressions inside', () => {
    const inputString = 'result-{{ 2 + 2 }}-final'
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['result-{{ 2 + 2 }}-final'])
  })

  it('should handle multiple braces with complex expressions', () => {
    const inputString = 'prefix-{{ someValue }}-mid-{{ another + value }}-suffix'
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString)
    expect(result.map((x) => {
      return inputString.slice(x.start, x.end)
    })).toEqual(['prefix-{{ someValue }}-mid-{{ another + value }}-suffix'])
  })
})

describe('tokenizer wechat-app-mall', () => {
  it('common usage', () => {
    const cases = [
      {
        input: '{{ times }}',
        expected: ['{{ times }}'],
      },
      {
        input: '{{ item.day }}',
        expected: ['{{ item.day }}'],
      },
      {
        input: `time-l {{ index == timeSelectIndex ? 'time-l-active' : '' }}`,
        expected: ['time-l', `{{ index == timeSelectIndex ? 'time-l-active' : '' }}`],
      },
      {
        input: `{{ index == timeSelectIndex }}`,
        expected: ['{{ index == timeSelectIndex }}'],
      },
      {
        input: `{{ selectSizePrice != selectSizePrice ? selectSizeOPrice : '' }}`,
        expected: [`{{ selectSizePrice != selectSizePrice ? selectSizeOPrice : '' }}`],
      },
      {
        input: `{{ skuCurGoods.basicInfo.name }}`,
        expected: [`{{ skuCurGoods.basicInfo.name }}`],
      },
      {
        input: `{{small.active? 'active' : ''}}`,
        expected: [`{{small.active? 'active' : ''}}`],
      },
      {
        input: `{{ avatarUrl ? avatarUrl : '/images/upload.jpg' }}`,
        expected: [`{{ avatarUrl ? avatarUrl : '/images/upload.jpg' }}`],
      },
      {
        input: `{{ actions && actions.length }}`,
        expected: [`{{ actions && actions.length }}`],
      },
      {
        input: `{{ item.disabled || item.loading || (canIUseGetUserProfile && item.openType === 'getUserInfo') ? '' : item.openType }}`,
        expected: [`{{ item.disabled || item.loading || (canIUseGetUserProfile && item.openType === 'getUserInfo') ? '' : item.openType }}`],
      },
      {
        input: `{{ item.color ? 'color: ' + item.color : '' }}`,
        expected: [`{{ item.color ? 'color: ' + item.color : '' }}`],
      },
      {
        input: `{{ utils.bem('action-sheet__item', { disabled: item.disabled || item.loading }) }} {{ item.className || '' }}`,
        expected: [`{{ utils.bem('action-sheet__item', { disabled: item.disabled || item.loading }) }}`, `{{ item.className || '' }}`],
      },
      {
        input: `{{ item.disabled || item.loading ? '' : 'onSelect' }}`,
        expected: [`{{ item.disabled || item.loading ? '' : 'onSelect' }}`],
      },
      {
        input: `custom-class {{ utils.bem('button', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }} {{ hairline ? 'van-hairline--surround' : '' }}`,
        expected: [`custom-class`, `{{ utils.bem('button', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }}`, `{{ hairline ? 'van-hairline--surround' : '' }}`],
      },
      {
        input: `{{ utils.bem('calendar__footer', { safeAreaInsetBottom }) }}`,
        expected: [`{{ utils.bem('calendar__footer', { safeAreaInsetBottom }) }}`],
      },
      {
        input: `van-calendar__popup--{{ position }}`,
        expected: [`van-calendar__popup--{{ position }}`],
      },
      {
        input: `{{ utils.bem('calendar__day', [item.type]) }} {{ item.className }}`,
        expected: [`{{ utils.bem('calendar__day', [item.type]) }}`, `{{ item.className }}`],
      },
      {
        input: `van-card__content {{ utils.bem('card__content', { center: centered }) }}`,
        expected: [`van-card__content`, `{{ utils.bem('card__content', { center: centered }) }}`],
      },
      {
        input: `{{ option.className }} {{ utils.optionClass(tab, valueKey, option) }}`,
        expected: [`{{ option.className }}`, `{{ utils.optionClass(tab, valueKey, option) }}`],
      },
      {
        input: `custom-class {{ utils.bem('cell', [size, { center, required, borderless: !border, clickable: isLink || clickable }]) }}`,
        expected: [`custom-class`, `{{ utils.bem('cell', [size, { center, required, borderless: !border, clickable: isLink || clickable }]) }}`],
      },
    ]
    const tokenizer = new Tokenizer()
    for (const item of cases) {
      const result = tokenizer.run(item.input)
      expect(result.map((x) => {
        return item.input.slice(x.start, x.end)
      })).toEqual(item.expected)
      tokenizer.reset()
    }
  })
})

describe('tokenizer1', () => {
  let tokenizer: Tokenizer

  beforeEach(() => {
    tokenizer = new Tokenizer()
  })

  it('should tokenize a simple text without expressions', () => {
    const input = 'simple text'
    const expected: Token[] = [
      { start: 0, end: 6, value: 'simple', expressions: [] },
      { start: 7, end: 11, value: 'text', expressions: [] },
    ]

    expect(tokenizer.run(input)).toEqual(expected)
  })

  it('should tokenize text with a single expression', () => {
    const input = 'hello {{name}}'
    const expected: Token[] = [
      { start: 0, end: 5, value: 'hello', expressions: [] },
      {
        start: 6,
        end: 14,
        value: '{{name}}',
        expressions: [
          { start: 6, end: 14, value: '{{name}}' },
        ],
      },
    ]

    expect(tokenizer.run(input)).toEqual(expected)
  })

  it('should tokenize text with multiple expressions', () => {
    const input = 'rd-tag-{{type}}-{{theme}}'
    const expected: Token[] = [
      {
        start: 0,
        end: 25,
        value: 'rd-tag-{{type}}-{{theme}}',
        expressions: [{
          start: 7,
          end: 15,
          value: '{{type}}',
        }, {
          start: 16,
          end: 25,
          value: '{{theme}}',
        }],
      },
    ]

    expect(tokenizer.run(input)).toEqual(expected)
  })

  it('should handle text with spaces and expressions', () => {
    const input = 'class is {{className}} and id is {{idName}}'
    const expected: Token[] = [
      { start: 0, end: 5, value: 'class', expressions: [] },
      { start: 6, end: 8, value: 'is', expressions: [] },
      {
        start: 9,
        end: 22,
        value: '{{className}}',
        expressions: [
          { start: 9, end: 22, value: '{{className}}' },
        ],
      },
      { start: 23, end: 26, value: 'and', expressions: [] },
      { start: 27, end: 29, value: 'id', expressions: [] },
      { start: 30, end: 32, value: 'is', expressions: [] },
      {
        start: 33,
        end: 43,
        value: '{{idName}}',
        expressions: [
          { start: 33, end: 43, value: '{{idName}}' },
        ],
      },
    ]

    expect(tokenizer.run(input)).toEqual(expected)
  })

  it('should handle empty input', () => {
    const input = ''
    const expected: Token[] = []

    expect(tokenizer.run(input)).toEqual(expected)
  })

  it('should handle input with only spaces', () => {
    const input = '   '
    const expected: Token[] = []

    expect(tokenizer.run(input)).toEqual(expected)
  })

  it('should handle input with only expressions', () => {
    const input = '{{only}}'
    const expected: Token[] = [
      {
        start: 0,
        end: 8,
        value: '{{only}}',
        expressions: [
          { start: 0, end: 8, value: '{{only}}' },
        ],
      },
    ]

    expect(tokenizer.run(input)).toEqual(expected)
  })

  it('should handle mixed content with leading and trailing spaces', () => {
    const input = '  prefix {{expr}} suffix  '
    const expected: Token[] = [
      { start: 2, end: 8, value: 'prefix', expressions: [] },
      {
        start: 9,
        end: 17,
        value: '{{expr}}',
        expressions: [
          { start: 9, end: 17, value: '{{expr}}' },
        ],
      },
      { start: 18, end: 24, value: 'suffix', expressions: [] },
    ]

    expect(tokenizer.run(input)).toEqual(expected)
  })

  it('should handle nested expressions correctly (although invalid in some contexts)', () => {
    const input = 'outer{{inner{{deep}}inner}}outer'
    const expected: Token[] = [
      {
        start: 0,
        end: 32,
        value: 'outer{{inner{{deep}}inner}}outer',
        expressions: [
          { start: 5, end: 20, value: '{{inner{{deep}}' },
        ],
      },
    ]

    expect(tokenizer.run(input)).toEqual(expected)
  })
})

describe('tokenizer bugs', () => {
  let tokenizer: Tokenizer

  beforeEach(() => {
    tokenizer = new Tokenizer()
  })
  it('bug 0 case 0', () => {
    const tokens = tokenizer.run('custom-class {{ utils.bem(\'button\', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }} {{ hairline ? \'van-hairline--surround\' : \'\' }}')
    expect(tokens).toMatchSnapshot()
  })

  it('bug 0 case 1', () => {
    const inputStr = '{{ utils.bem(\'button\', [type, size, { block, round, plain, square, loading, disabled, hairline, unclickable: disabled || loading }]) }}'
    const tokens = tokenizer.run(inputStr)
    expect(tokens).toMatchSnapshot()
    expect(tokens[0].value).toBe(inputStr)
  })
})
