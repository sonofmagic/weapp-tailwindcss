import type {
  AnimationTarget,
  DocumentWithViewTransition,
  FallbackCoordinatesResolver,
  Logger,
  ToggleEventLike,
  ToggleThemeCapabilities,
  ToggleThemeEnvironment,
} from './utils/types'
import {
  bindViewTransition,
  detectReducedMotion,
  resolveAnimationTarget,
  resolveGlobalDocument,
  resolveGlobalWindow,
  supportsElementAnimate,
} from './utils/environment'
import {
  createClipPathKeyframes,
  resolveCoordinates,
  resolveViewport,
} from './utils/geometry'
import { invokeMaybePromise } from './utils/promise'

export type { FallbackCoordinatesResolver, ToggleThemeCapabilities, ToggleThemeEnvironment } from './utils/types'

export interface UseToggleThemeOptions {
  /**
   * isDark.value = !isDark.value
   */
  toggle?: () => void | Promise<void>
  /**
   * isDark.value
   */
  isCurrentDark?: () => boolean
  viewTransition?: {
    before?: () => void | Promise<void>
    /**
     * await nextTick()
     */
    after?: () => void | Promise<void>
    callback?: () => void | Promise<void>
  }
  duration?: number

  easing?: string
  document?: DocumentWithViewTransition
  window?: Window & typeof globalThis
  animationTarget?: AnimationTarget
  fallbackCoordinates?: FallbackCoordinatesResolver
  logger?: Logger
}

export interface UseToggleThemeResult {
  toggleTheme: (event?: ToggleEventLike) => Promise<void>
  isAppearanceTransition: boolean
  capabilities: ToggleThemeCapabilities
  environment: ToggleThemeEnvironment
}

export function useToggleTheme(options: UseToggleThemeOptions): UseToggleThemeResult {
  const {
    toggle,
    viewTransition,
    isCurrentDark,
    duration = 400,
    easing = 'ease-in',
    document: documentLike,
    window: windowLike,
    animationTarget,
    fallbackCoordinates,
    logger = console,
  } = Object.assign({}, options)

  const resolvedDocument = resolveGlobalDocument(documentLike)
  const resolvedWindow = resolveGlobalWindow(windowLike)
  const target = resolveAnimationTarget(animationTarget, resolvedDocument)

  const startViewTransition = bindViewTransition(resolvedDocument)
  const prefersReducedMotion = detectReducedMotion(resolvedWindow)
  const supportsAnimate = supportsElementAnimate(target)
  const hasViewTransition = Boolean(startViewTransition)
  const isAppearanceTransition = Boolean(hasViewTransition && !prefersReducedMotion && supportsAnimate)
  const capabilities: ToggleThemeCapabilities = {
    hasViewTransition,
    prefersReducedMotion,
    supportsAnimate,
  }
  const environment: ToggleThemeEnvironment = {
    document: resolvedDocument,
    window: resolvedWindow,
    target,
  }

  async function runTransitionWork() {
    if (viewTransition?.callback) {
      await invokeMaybePromise(viewTransition.callback)
      return
    }
    await invokeMaybePromise(viewTransition?.before)
    await invokeMaybePromise(toggle)
    await invokeMaybePromise(viewTransition?.after)
  }

  async function runWithoutViewTransition() {
    if (viewTransition?.callback) {
      await invokeMaybePromise(viewTransition.callback)
      return
    }
    await invokeMaybePromise(toggle)
  }

  async function toggleTheme(event?: ToggleEventLike) {
    if (!isAppearanceTransition || !environment.target) {
      await runWithoutViewTransition()
      return
    }

    const viewport = resolveViewport(environment.window, environment.target)
    const coordinates = resolveCoordinates(event, fallbackCoordinates, viewport, environment.target)

    if (!coordinates) {
      await runWithoutViewTransition()
      return
    }

    const { x, y } = coordinates
    const endRadius = Math.hypot(
      Math.max(x, viewport.viewportWidth - x),
      Math.max(y, viewport.viewportHeight - y),
    )
    const { clipPath, reverseClipPath } = createClipPathKeyframes({ x, y, endRadius })

    let transitionWorkExecuted = false
    try {
      const transition = startViewTransition!(async () => {
        transitionWorkExecuted = true
        await runTransitionWork()
      })

      await transition.ready

      const isDark = Boolean(isCurrentDark?.())
      const animation = environment.target.animate?.(
        {
          clipPath: isDark ? reverseClipPath : clipPath,
        },
        {
          duration,
          easing,
          pseudoElement: isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )

      await animation?.finished.catch(() => {})
    }
    catch (error) {
      logger?.warn?.('[theme-transition] Falling back to simple toggle because view transition failed.', error)
      if (!transitionWorkExecuted) {
        await runWithoutViewTransition()
      }
    }
  }
  return {
    toggleTheme,
    isAppearanceTransition,
    capabilities,
    environment,
  }
}
// https://github.com/antfu-collective/icones/blob/0869721765eeae895cc583b3a2d07fc4a35d70c8/src/components/DarkSwitcher.vue#L27
