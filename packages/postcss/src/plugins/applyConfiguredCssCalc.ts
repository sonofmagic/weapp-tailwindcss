import type { IStyleHandlerOptions } from '../types'
import { postcss } from '../postcss-runtime'
import { getCalcPlugin } from './getCalcPlugin'

export type ApplyConfiguredCssCalcOptions = Pick<
  IStyleHandlerOptions,
  'cssCalc' | 'cssOptions' | 'customPropertyValues'
> & {
  /** 额外用于收集自定义属性的 CSS，例如生成器完整产物。 */
  contextCss?: string | undefined
}

function resolveCssCalcOption(options: ApplyConfiguredCssCalcOptions) {
  return options.cssOptions?.cssCalc ?? options.cssCalc
}

function collectCustomPropertyValues(css: string) {
  const values = new Map<string, string>()
  if (!css.includes('--')) {
    return values
  }

  try {
    const root = postcss.parse(css)
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        values.set(decl.prop, decl.value.trim())
      }
    })
  }
  catch {
    // 当前块无法解析时跳过收集，仍尝试按已有映射计算。
  }

  return values
}

function mergeCustomPropertyValues(
  css: string,
  options: ApplyConfiguredCssCalcOptions,
) {
  const values = collectCustomPropertyValues(options.contextCss ?? '')
  for (const [name, value] of collectCustomPropertyValues(css)) {
    values.set(name, value)
  }
  for (const [name, value] of options.customPropertyValues ?? []) {
    values.set(name, value)
  }
  return values
}

/**
 * 仅按 `cssCalc` 配置预计算 `calc()` / `var()`，不跑小程序选择器替换或单位转换。
 */
export async function applyConfiguredCssCalc(
  css: string,
  options: ApplyConfiguredCssCalcOptions = {},
) {
  const cssCalc = resolveCssCalcOption(options)
  if (!cssCalc || !css.includes('calc(')) {
    return css
  }

  const plugin = getCalcPlugin({
    cssCalc,
    customPropertyValues: mergeCustomPropertyValues(css, options),
  } as IStyleHandlerOptions)
  if (!plugin) {
    return css
  }

  try {
    const result = await postcss([plugin]).process(css, { from: undefined })
    return result.css
  }
  catch {
    return css
  }
}
