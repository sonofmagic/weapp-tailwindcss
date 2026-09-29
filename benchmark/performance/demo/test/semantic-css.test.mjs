import autoprefixer from 'autoprefixer'
import postcss from 'postcss'
import { expect, it } from 'vitest'
import { comparableCss } from '../semantic-css.mjs'
import { canonicalStyleEvidence } from '../css-values.mjs'

it('真实 Autoprefixer 的旧 flex 回退被同规则后续标准声明覆盖，原始 CSS 不被修改', async () => {
  const source = '.flex{display:flex}'
  const raw = (await postcss([autoprefixer({ overrideBrowserslist: ['Android >= 4.1', 'ios >= 8'], flexbox: 'no-2009' })]).process(source, { from: undefined })).css
  expect(raw).toContain('display:-webkit-flex;display:flex')
  const compared = comparableCss(raw)
  expect(compared).not.toContain('-webkit-flex')
  expect(compared).toContain('display:flex')
  expect(raw).toContain('-webkit-flex')
})

it('不删除不同规则、条件、顺序或优先级中的前缀，也不抹去布局差异', () => {
  for (const css of [
    '.a{display:-webkit-flex}.b{display:flex}',
    '.a{display:-webkit-flex;@media(min-width:1px){display:flex}}',
    '.a{display:flex;display:-webkit-flex}',
    '.a{display:-webkit-flex!important;display:flex}',
    '.a{display:-webkit-flex;display:block}',
  ]) expect(comparableCss(css)).toBe(css)
  const raw = { rules: { flex: ['-webkit-flex', 'flex'], height: ['8rpx'] } }
  const comparisonProbes = { rules: { flex: ['flex'], height: ['8rpx'] } }
  expect(canonicalStyleEvidence({ probes: raw, comparisonProbes })).toEqual(canonicalStyleEvidence({ probes: comparisonProbes }))
  expect(canonicalStyleEvidence({ probes: raw, comparisonProbes: { rules: { flex: ['block'], height: ['9rpx'] } } }))
    .not.toEqual(canonicalStyleEvidence({ probes: comparisonProbes }))
})
