import {
  collectCssApplyUtilities,
  cssToClassStyleValue,
  expandCssApplySourcesToStyleValue,
} from '@/index'

describe('uni-app x css class style value', () => {
  it('compiles class rules into camelCase declarations with escaped aliases', () => {
    const utilityStyles = cssToClassStyleValue([
      '.flex{display:flex}',
      '.w-\\[12px\\]{width:12px}',
      '.leading-_b26px_B{--tw-leading:26px;line-height:26px}',
    ].join(''))!
    expect(cssToClassStyleValue('.broken{')).toBeUndefined()
    expect(utilityStyles.flex['']).toMatchObject({ display: 'flex' })
    expect(utilityStyles['w-[12px]']['']).toMatchObject({ width: 12 })
    expect(utilityStyles['leading-_b26px_B']['']).toMatchObject({
      '-TwLeading': 26,
      lineHeight: '26px',
    })
  })

  it('expands apply sources and collects utilities from scss', () => {
    const utilityStyles = cssToClassStyleValue('.flex{display:flex}.w-\\[12px\\]{width:12px}')!
    const applied = expandCssApplySourcesToStyleValue('.card{@apply flex w-[12px]}', utilityStyles)
    expect(applied?.card['']).toMatchObject({ display: 'flex', width: 12 })
    expect(expandCssApplySourcesToStyleValue('.broken{', utilityStyles)).toBeUndefined()
    expect([...collectCssApplyUtilities('.a{@apply flex block}')]).toEqual(['flex', 'block'])
    expect(collectCssApplyUtilities('.broken{').size).toBe(0)
  })
})
