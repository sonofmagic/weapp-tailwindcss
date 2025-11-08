export type MaybePromise<T> = T | Promise<T>

export interface ToggleCoordinates {
  x: number
  y: number
}

export interface ViewportDimensions {
  viewportWidth: number
  viewportHeight: number
}

export interface ToggleEventLike {
  clientX: number
  clientY: number
}

export type FallbackCoordinatesResolver = ToggleCoordinates | ((context: {
  viewportWidth: number
  viewportHeight: number
  target: Element | null
}) => ToggleCoordinates | null | undefined)

export interface ViewTransitionLike {
  ready: Promise<void>
  finished: Promise<void>
  updateCallbackDone: Promise<void>
}

export type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => MaybePromise<void>) => ViewTransitionLike
}

export type AnimationTarget = Element | (() => Element | null)

export type Logger = Pick<Console, 'warn'>

export interface ToggleThemeCapabilities {
  hasViewTransition: boolean
  prefersReducedMotion: boolean
  supportsAnimate: boolean
}

export interface ToggleThemeEnvironment {
  document: DocumentWithViewTransition | undefined
  window: (Window & typeof globalThis) | undefined
  target: Element | null
}
