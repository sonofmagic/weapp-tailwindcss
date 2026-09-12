import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import { collectCustomPropertyValues, mergeCustomPropertyValues } from './incremental-cache'

type GenerationStyleOptions = Partial<IStyleHandlerOptions> & {
  cssOptions?: Partial<IStyleHandlerOptions>
}

export function resolveGenerationStyleContext(
  sourceCss: string,
  generatedCss: string,
  options?: GenerationStyleOptions,
): GenerationStyleOptions | undefined {
  const calc = options?.cssOptions?.cssCalc ?? options?.cssCalc
  const include = Array.isArray(calc) ? calc : calc && typeof calc === 'object' ? calc.includeCustomProperties : undefined
  // 完整产物的颜色等兼容处理会读取当前 AST；仅 calc 显式需要变量时额外收集上下文。
  if (calc !== true && !include?.length) {
    return options
  }
  const customPropertyValues = collectCustomPropertyValues(sourceCss)
  mergeCustomPropertyValues(customPropertyValues, generatedCss)
  for (const [name, value] of options?.customPropertyValues ?? []) {
    customPropertyValues.set(name, value)
  }
  return { ...options, customPropertyValues }
}
