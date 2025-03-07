export interface UseToggleThemeOptions {
  /**
   * isDark.value = !isDark.value
   * @returns
   */
  toggle: () => void | Promise<void>
  /**
   * isDark.value
   * @returns
   */
  isCurrentDark: () => boolean
  viewTransition?: {
    before?: () => void | Promise<void>
    /**
     * await nextTick()
     * @returns
     */
    after?: () => void | Promise<void>
    callback?: () => any
  }
  duration?: number

  easing?: string
}

export function useToggleTheme(options: UseToggleThemeOptions) {
  const isAppearanceTransition = typeof document !== 'undefined'
    // @ts-expect-error: Transition API
    && document.startViewTransition
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const { toggle, viewTransition, isCurrentDark, duration = 400, easing = 'ease-in' } = Object.assign({}, options)
  async function toggleTheme(event?: { clientX: number, clientY: number }) {
    if (!isAppearanceTransition || !event) {
      await toggle?.()
      return
    }

    const x = event.clientX
    const y = event.clientY

    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )
    const transition = document.startViewTransition(viewTransition?.callback
      ? viewTransition.callback()
      : async () => {
        await viewTransition?.before?.()
        await toggle?.()
        await viewTransition?.after?.()
      })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      const isDark = isCurrentDark?.()

      document.documentElement.animate(
        {
          clipPath: isDark
            ? [...clipPath].reverse()
            : clipPath,
        },
        {
          duration,
          easing,
          pseudoElement: isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }
  return {
    toggleTheme,
    isAppearanceTransition,
  }
}
// https://github.com/antfu-collective/icones/blob/0869721765eeae895cc583b3a2d07fc4a35d70c8/src/components/DarkSwitcher.vue#L27
