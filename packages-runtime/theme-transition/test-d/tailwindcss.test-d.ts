import type { ThemeTransitionPluginOptions } from '../tailwindcss'
import { expectType } from 'tsd'
import themeTransitionPlugin, { themeTransitionPlugin as namedPlugin } from '../tailwindcss'

const options: ThemeTransitionPluginOptions = {
  zIndex: {
    floor: 1,
    ceiling: 2,
  },
  baseCss: {
    animation: 'none',
  },
}

expectType<true>(themeTransitionPlugin.__isOptionsFunction)
expectType<ReturnType<typeof themeTransitionPlugin>>(themeTransitionPlugin(options))
expectType<ReturnType<typeof namedPlugin>>(namedPlugin(options))
