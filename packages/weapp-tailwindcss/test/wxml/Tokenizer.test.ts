import MagicString from 'magic-string'
import { Tokenizer } from '@/wxml/Tokenizer'

describe('tokenizer', () => {
  it('should tokenize a string with spaces and text correctly', () => {
    const inputString = new MagicString('2xl:text-xs rd-tag-{{type}}-{{theme}} {{prefix}}-btn')
    const tokenizer = new Tokenizer()
    const result = tokenizer.run(inputString.original)
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
