import type { AcceptedPlugin } from 'postcss'
import type { IStyleHandlerOptions } from '../types'
import postcssPresetEnv from 'postcss-preset-env'
import { createContext } from './ctx'
import { getCalcPlugin } from './getCalcPlugin'
import { getCustomPropertyCleaner } from './getCustomPropertyCleaner'
import { getPxTransformPlugin } from './getPxTransformPlugin'
import { getRemTransformPlugin } from './getRemTransformPlugin'
import { postcssWeappTailwindcssPostPlugin as post } from './post'
import { postcssWeappTailwindcssPrePlugin as pre } from './pre'

function normalizePlugins(options: IStyleHandlerOptions): AcceptedPlugin[] {
  const plugins: AcceptedPlugin[] = []

  const pxPlugin = getPxTransformPlugin(options)
  if (pxPlugin) {
    plugins.push(pxPlugin)
  }

  const remPlugin = getRemTransformPlugin(options)
  if (remPlugin) {
    plugins.push(remPlugin)
  }

  const calcPlugin = getCalcPlugin(options)
  if (calcPlugin) {
    plugins.push(calcPlugin)
  }

  const customPropertyCleaner = getCustomPropertyCleaner(options)
  if (customPropertyCleaner) {
    plugins.push(customPropertyCleaner)
  }

  return plugins
}

export function getPlugins(options: IStyleHandlerOptions): AcceptedPlugin[] {
  const ctx = createContext()
  options.ctx = ctx

  const plugins: AcceptedPlugin[] = [
    ...(options.postcssOptions?.plugins ?? []),
    pre(options),
    postcssPresetEnv(options.cssPresetEnv!),
    ...normalizePlugins(options),
    post(options),
  ].filter(Boolean) as AcceptedPlugin[]

  return plugins
}

export { postcssWeappTailwindcssPostPlugin } from './post'
export { postcssWeappTailwindcssPrePlugin } from './pre'
export { default as postcssRem2rpx } from 'postcss-rem-to-responsive-pixel'
