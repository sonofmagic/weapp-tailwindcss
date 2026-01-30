import type {
  FallbackCoordinatesResolver,
  ToggleThemeCapabilities,
  ToggleThemeEnvironment,
  UseToggleThemeOptions,
} from '..'
import { expectAssignable, expectType } from 'tsd'
import { useToggleTheme } from '..'

const resolver: FallbackCoordinatesResolver = () => ({ x: 0, y: 0 })

const options: UseToggleThemeOptions = {
  duration: 200,
  easing: 'ease-out',
  toggle: () => {},
  isCurrentDark: () => true,
  fallbackCoordinates: resolver,
  viewTransition: {
    before: async () => {},
    after: () => {},
  },
}

const result = useToggleTheme(options)
expectType<Promise<void>>(result.toggleTheme())
expectType<boolean>(result.isAppearanceTransition)
expectAssignable<ToggleThemeCapabilities>(result.capabilities)
expectAssignable<ToggleThemeEnvironment>(result.environment)
