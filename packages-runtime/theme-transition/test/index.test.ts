import { vi } from 'vitest'
import { useToggleTheme } from '@/index'

function createDocumentMock() {
  const animate = vi.fn(() => ({
    finished: Promise.resolve(),
  }))

  const startViewTransition = vi.fn((callback: () => Promise<void> | void) => {
    const updateCallbackDone = Promise.resolve().then(async () => {
      await callback()
    })
    return {
      ready: updateCallbackDone.then(() => {}),
      finished: Promise.resolve(),
      updateCallbackDone,
    }
  })

  const documentLike = {
    documentElement: {
      animate,
      getBoundingClientRect: () => ({ width: 1024, height: 768, top: 0, left: 0, right: 1024, bottom: 768 }),
    },
    startViewTransition,
  } as unknown as Parameters<typeof useToggleTheme>[0]['document']

  return {
    animate,
    documentLike,
    startViewTransition,
  }
}

const windowMock = {
  innerWidth: 1024,
  innerHeight: 768,
  matchMedia: () => ({ matches: false }),
} as unknown as NonNullable<Parameters<typeof useToggleTheme>[0]['window']>

describe('useToggleTheme', () => {
  it('falls back to simple toggle when View Transition API is unavailable', async () => {
    let dark = false
    const toggle = vi.fn(() => {
      dark = !dark
    })

    const { toggleTheme, isAppearanceTransition, capabilities, environment } = useToggleTheme({
      toggle,
      isCurrentDark: () => dark,
    })

    expect(isAppearanceTransition).toBe(false)
    expect(capabilities).toEqual({ hasViewTransition: false, prefersReducedMotion: false, supportsAnimate: false })
    expect(environment.target).toBe(document?.documentElement ?? null)
    await toggleTheme()
    expect(toggle).toHaveBeenCalledOnce()
    expect(dark).toBe(true)
  })

  it('runs view transition when supported', async () => {
    let dark = false
    const { documentLike, startViewTransition, animate } = createDocumentMock()

    const { toggleTheme, isAppearanceTransition, capabilities, environment } = useToggleTheme({
      toggle: () => {
        dark = !dark
      },
      isCurrentDark: () => dark,
      document: documentLike,
      window: windowMock,
    })

    expect(isAppearanceTransition).toBe(true)
    expect(capabilities).toEqual({ hasViewTransition: true, prefersReducedMotion: false, supportsAnimate: true })
    expect(environment.target).toBe(documentLike.documentElement)
    await toggleTheme({ clientX: 100, clientY: 120 })

    expect(startViewTransition).toHaveBeenCalledOnce()
    expect(animate).toHaveBeenCalledOnce()

    expect(dark).toBe(true)

    const [keyframes, options] = animate.mock.calls[0]
    const expectedRadius = Math.hypot(
      Math.max(100, 1024 - 100),
      Math.max(120, 768 - 120),
    )
    expect(keyframes.clipPath).toEqual([
      `circle(${expectedRadius}px at 100px 120px)`,
      'circle(0px at 100px 120px)',
    ])
    expect(options).toMatchObject({
      duration: 400,
      easing: 'ease-in',
      pseudoElement: '::view-transition-old(root)',
    })
  })

  it('computes fallback coordinates when event is missing', async () => {
    let dark = false
    const { documentLike, animate } = createDocumentMock()

    const { toggleTheme, capabilities } = useToggleTheme({
      toggle: () => {
        dark = !dark
      },
      isCurrentDark: () => dark,
      document: documentLike,
      window: windowMock,
      fallbackCoordinates: ({ viewportWidth, viewportHeight }) => ({
        x: viewportWidth / 2,
        y: viewportHeight / 2,
      }),
    })

    await toggleTheme()
    expect(animate).toHaveBeenCalledOnce()
    expect(dark).toBe(true)
    expect(capabilities.hasViewTransition).toBe(true)
  })

  it('warns and falls back when view transition throws before executing work', async () => {
    let dark = false
    const warn = vi.fn()
    const animate = vi.fn(() => ({
      finished: Promise.resolve(),
    }))

    const documentLike = {
      documentElement: {
        animate,
        getBoundingClientRect: () => ({ width: 1024, height: 768, top: 0, left: 0, right: 1024, bottom: 768 }),
      },
      startViewTransition: vi.fn(() => {
        throw new Error('unsupported')
      }),
    } as unknown as Parameters<typeof useToggleTheme>[0]['document']

    const toggle = vi.fn(() => {
      dark = !dark
    })

    const { toggleTheme, capabilities } = useToggleTheme({
      toggle,
      isCurrentDark: () => dark,
      document: documentLike,
      window: windowMock,
      logger: { warn },
    })

    await toggleTheme({ clientX: 10, clientY: 10 })

    expect(warn).toHaveBeenCalledOnce()
    expect(toggle).toHaveBeenCalledOnce()
    expect(dark).toBe(true)
    expect(capabilities.hasViewTransition).toBe(true)
  })

  it('skips view transitions when coordinates cannot be resolved', async () => {
    let dark = false
    const toggle = vi.fn(() => {
      dark = !dark
    })
    const { documentLike, startViewTransition, animate } = createDocumentMock()

    const { toggleTheme } = useToggleTheme({
      toggle,
      isCurrentDark: () => dark,
      document: documentLike,
      window: windowMock,
    })

    await toggleTheme()

    expect(startViewTransition).not.toHaveBeenCalled()
    expect(animate).not.toHaveBeenCalled()
    expect(toggle).toHaveBeenCalledOnce()
    expect(dark).toBe(true)
  })

  it('executes viewTransition callback when appearance transitions are disabled', async () => {
    const toggle = vi.fn()
    const callback = vi.fn()

    const { toggleTheme, isAppearanceTransition } = useToggleTheme({
      toggle,
      isCurrentDark: () => false,
      viewTransition: {
        callback,
      },
    })

    expect(isAppearanceTransition).toBe(false)
    await toggleTheme()

    expect(callback).toHaveBeenCalledOnce()
    expect(toggle).not.toHaveBeenCalled()
  })

  it('executes viewTransition callback inside view transitions when supported', async () => {
    const callback = vi.fn()
    const { documentLike } = createDocumentMock()

    const { toggleTheme } = useToggleTheme({
      toggle: vi.fn(),
      isCurrentDark: () => false,
      document: documentLike,
      window: windowMock,
      viewTransition: {
        callback,
      },
    })

    await toggleTheme({ clientX: 10, clientY: 10 })
    expect(callback).toHaveBeenCalledOnce()
  })

  it('skips fallback when failures occur after transition work starts', async () => {
    const warn = vi.fn()
    const animate = vi.fn(() => {
      throw new Error('animate failed')
    })
    const startViewTransition = vi.fn(async (cb: () => Promise<void>) => {
      await cb()
      return {
        ready: Promise.resolve(),
        finished: Promise.resolve(),
      }
    })

    const documentLike = {
      documentElement: {
        animate,
        getBoundingClientRect: () => ({ width: 100, height: 100, top: 0, left: 0, right: 100, bottom: 100 }),
      },
      startViewTransition,
    } as any

    const { toggleTheme } = useToggleTheme({
      toggle: vi.fn(),
      document: documentLike,
      window: windowMock,
      logger: { warn },
    })

    await toggleTheme({ clientX: 10, clientY: 10 })

    expect(startViewTransition).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledOnce()
  })
})
