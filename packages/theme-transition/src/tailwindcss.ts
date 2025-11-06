import type { Config } from 'tailwindcss'
import type { CSSRuleObject } from 'tailwindcss/types/config'
import defu from 'defu'
import plugin from 'tailwindcss/plugin'

export interface ThemeTransitionPluginOptions {
  zIndex?: {
    ceiling?: string | number
    floor?: string | number
  }
  // 暂留：darkSelector?: string
  baseCss?: CSSRuleObject
  darkMode?: Config['darkMode']
}

type DeepRequired<T> = Required<{
  [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>
}>

// 参考：https://github.com/tailwindlabs/tailwindcss/blob/557ed8ccecccf703296c186b6e996edf9933e1b7/packages/tailwindcss/src/compat/plugin-api.ts#L28
// 参考：https://github.com/tailwindlabs/tailwindcss/blob/557ed8ccecccf703296c186b6e996edf9933e1b7/packages/tailwindcss/src/compat/plugin-api.ts#L92
// 参考：https://github.com/tailwindlabs/tailwindcss/tree/main
// 参考：https://github.com/tailwindlabs/tailwindcss/blob/557ed8ccecccf703296c186b6e996edf9933e1b7/packages/tailwindcss/src/compat/dark-mode.ts#L4
export function themeTransitionPlugin(themeTransitionPluginOptions?: ThemeTransitionPluginOptions) {
  const { baseCss, zIndex, darkMode: specDarkMode } = defu<
    DeepRequired<ThemeTransitionPluginOptions>,
    ThemeTransitionPluginOptions[]
  >(
    themeTransitionPluginOptions,
    {
      baseCss: {
        mixBlendMode: 'normal',
        animation: 'none',
      },
      zIndex: {
        ceiling: 2147483646,
        floor: 1,
      },
    },
  )
  const floor = zIndex.floor.toString()
  const ceiling = zIndex.ceiling.toString()
  return plugin(({ addBase, config }) => {
    const darkMode: Config['darkMode'] = specDarkMode ?? config('darkMode')
    let [mode, selector = '.dark'] = Array.isArray(darkMode) ? darkMode : [darkMode]
    if (mode === 'variant') {
      let formats

      if (Array.isArray(selector)) {
        formats = selector
      }
      else if (typeof selector === 'function') {
        formats = selector
      }
      else if (typeof selector === 'string') {
        formats = [selector]
      }

      if (Array.isArray(formats)) {
        for (const format of formats) {
          if (format === '.dark') {
            mode = undefined
            console.warn(
              'When using `variant` for `darkMode`, you must provide a selector.\nExample: `darkMode: ["variant", ".your-selector &"]`',
            )
          }
          else if (!format.includes('&')) {
            mode = undefined
            console.warn(
              'When using `variant` for `darkMode`, your selector must contain `&`.\nExample `darkMode: ["variant", ".your-selector &"]`',
            )
          }
        }
      }

      selector = formats as any
    }
    const rule: CSSRuleObject = {
      '::view-transition-old(root),\n::view-transition-new(root)': baseCss,
      '::view-transition-old(root)': {
        zIndex: floor,
      },
      '::view-transition-new(root)': {
        zIndex: ceiling,
      },
    }
    if (mode === 'selector' || mode === 'class') {
      rule[`${selector}::view-transition-old(root)`] = {
        zIndex: ceiling,
      }
      rule[`${selector}::view-transition-new(root)`] = {
        zIndex: floor,
      }
    }
    else if (mode === 'media') {
      rule['@media (prefers-color-scheme: dark)'] = {
        '::view-transition-old(root)': {
          zIndex: ceiling,
        },
        '::view-transition-new(root)': {
          zIndex: floor,
        },
      }
    }
    // 或者 mode === 'variant'

    addBase(
      rule,
    )
  })
}

export default themeTransitionPlugin
