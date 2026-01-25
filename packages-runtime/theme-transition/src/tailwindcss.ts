import defu from 'defu'
import plugin from 'tailwindcss/plugin'

type CSSRuleValue = string | string[] | CSSRuleObject

interface CSSRuleObject {
  [selector: string]: CSSRuleValue
}

type VariantSelector = string | string[] | ((...args: unknown[]) => string)

type TailwindPluginApi = Parameters<ReturnType<typeof plugin>['handler']>[0]

type DarkModeStrategy = 'media' | 'class' | 'selector' | 'variant'
type DarkModeConfig = 'media' | 'class' | 'selector' | ['class', string] | ['selector', string] | ['variant', VariantSelector]

export interface ThemeTransitionPluginOptions {
  zIndex?: {
    ceiling?: string | number
    floor?: string | number
  }
  // 暂留：darkSelector?: string
  baseCss?: CSSRuleObject
  darkMode?: DarkModeConfig
}

type DeepRequired<T> = Required<{
  [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>
}>

const defaultOptions: ThemeTransitionPluginOptions = {
  baseCss: {
    mixBlendMode: 'normal',
    animation: 'none',
  },
  zIndex: {
    ceiling: 2147483646,
    floor: 1,
  },
}

function isPluginApi(value: unknown): value is TailwindPluginApi {
  if (!value || typeof value !== 'object') {
    return false
  }

  const maybeApi = value as TailwindPluginApi
  return typeof maybeApi.addBase === 'function' && typeof maybeApi.config === 'function'
}

function normalizeVariantSelector(selector: unknown): VariantSelector | undefined {
  if (Array.isArray(selector)) {
    return selector
  }

  if (typeof selector === 'function') {
    return selector as (...args: unknown[]) => string
  }

  if (typeof selector === 'string') {
    return [selector]
  }

  return undefined
}

// 参考：https://github.com/tailwindlabs/tailwindcss/blob/557ed8ccecccf703296c186b6e996edf9933e1b7/packages/tailwindcss/src/compat/plugin-api.ts#L28
// 参考：https://github.com/tailwindlabs/tailwindcss/blob/557ed8ccecccf703296c186b6e996edf9933e1b7/packages/tailwindcss/src/compat/plugin-api.ts#L92
// 参考：https://github.com/tailwindlabs/tailwindcss/tree/main
// 参考：https://github.com/tailwindlabs/tailwindcss/blob/557ed8ccecccf703296c186b6e996edf9933e1b7/packages/tailwindcss/src/compat/dark-mode.ts#L4
function createThemeTransitionPlugin(themeTransitionPluginOptions?: ThemeTransitionPluginOptions) {
  const { baseCss, zIndex, darkMode: specDarkMode } = defu<
    DeepRequired<ThemeTransitionPluginOptions>,
    ThemeTransitionPluginOptions[]
  >(
    themeTransitionPluginOptions,
    defaultOptions,
  )
  const floor = zIndex.floor.toString()
  const ceiling = zIndex.ceiling.toString()
  return plugin(({ addBase, config }) => {
    const darkMode = (specDarkMode ?? config('darkMode')) as DarkModeConfig | undefined
    const defaultSelector = '.dark'
    let mode: DarkModeStrategy | undefined
    let selector: VariantSelector | undefined = defaultSelector

    if (Array.isArray(darkMode)) {
      mode = darkMode[0]
      selector = (darkMode[1] as VariantSelector | undefined) ?? defaultSelector
    }
    else {
      mode = darkMode
    }

    if (mode === 'variant') {
      const formats = normalizeVariantSelector(selector)

      if (Array.isArray(formats)) {
        for (const format of formats) {
          if (format === '.dark') {
            mode = undefined
            // eslint-disable-next-line no-console
            console.warn(
              'When using `variant` for `darkMode`, you must provide a selector.\nExample: `darkMode: ["variant", ".your-selector &"]`',
            )
          }
          else if (!format.includes('&')) {
            mode = undefined
            // eslint-disable-next-line no-console
            console.warn(
              'When using `variant` for `darkMode`, your selector must contain `&`.\nExample `darkMode: ["variant", ".your-selector &"]`',
            )
          }
        }
      }

      selector = formats ?? selector
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
      const selectorValue = typeof selector === 'string'
        ? selector
        : Array.isArray(selector)
          ? (selector[0] ?? defaultSelector)
          : defaultSelector
      rule[`${selectorValue}::view-transition-old(root)`] = {
        zIndex: ceiling,
      }
      rule[`${selectorValue}::view-transition-new(root)`] = {
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

function themeTransitionPlugin(
  themeTransitionPluginOptions?: ThemeTransitionPluginOptions,
): ReturnType<typeof plugin>
function themeTransitionPlugin(themeTransitionPluginOptions: TailwindPluginApi): void
function themeTransitionPlugin(
  themeTransitionPluginOptions?: ThemeTransitionPluginOptions | TailwindPluginApi,
) {
  if (isPluginApi(themeTransitionPluginOptions)) {
    const instance = createThemeTransitionPlugin()
    instance.handler(themeTransitionPluginOptions)
    return
  }

  return createThemeTransitionPlugin(themeTransitionPluginOptions)
}

const themeTransitionPluginWithOptions = Object.assign(themeTransitionPlugin, {
  __isOptionsFunction: true,
})

export default themeTransitionPluginWithOptions
export { themeTransitionPluginWithOptions as themeTransitionPlugin }
