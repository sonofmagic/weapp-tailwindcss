export interface UseToggleDarkOptions {
  toggle: () => any
  getDarkValue: () => any
  viewTransition?: {
    before?: () => any
    after?: () => any
    callback?: () => any
  }
}

export function useToggleDark(options: UseToggleDarkOptions) {
  const isAppearanceTransition = typeof document !== 'undefined'
    // @ts-expect-error: Transition API
    && document.startViewTransition
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const { toggle, viewTransition, getDarkValue } = options
  async function toggleDark(event?: MouseEvent) {
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
      const isDark = getDarkValue?.()
      document.documentElement.animate(
        {
          clipPath: isDark
            ? [...clipPath].reverse()
            : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-in',
          pseudoElement: isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }
  return {
    toggleDark,
    isAppearanceTransition,
  }
}
