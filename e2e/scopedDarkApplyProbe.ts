import postcss from 'postcss'

export interface ScopedDarkApplyProbeState {
  darkBackground: string
  display: 'block' | 'flex' | 'inline-flex'
}

export const initialScopedDarkApplyProbeState: ScopedDarkApplyProbeState = {
  darkBackground: '#232323',
  display: 'flex',
}

function createApplyDirective(state: ScopedDarkApplyProbeState) {
  return `@apply ${state.display} bg-[#f1f1f1] dark:bg-[${state.darkBackground}];`
}

export function replaceScopedDarkApplyProbeState(
  source: string,
  from: ScopedDarkApplyProbeState,
  to: ScopedDarkApplyProbeState,
) {
  return source.replace(createApplyDirective(from), createApplyDirective(to))
}

function collectScopedDarkApplyProbeDeclarations(source: string) {
  const baseBackgrounds = new Set<string>()
  const darkBackgrounds = new Set<string>()
  const displays = new Set<string>()
  const root = postcss.parse(source)
  root.walkRules((rule) => {
    if (!rule.selector.includes('.hello-scss')) {
      return
    }
    let parent = rule.parent
    let isDark = false
    while (parent) {
      if (parent.type === 'atrule'
        && parent.name === 'media'
        && parent.params.includes('prefers-color-scheme: dark')) {
        isDark = true
        break
      }
      parent = parent.parent
    }
    rule.walkDecls((declaration) => {
      const value = declaration.value.toLowerCase()
      if (declaration.prop === 'background-color') {
        (isDark ? darkBackgrounds : baseBackgrounds).add(value)
      }
      else if (!isDark && declaration.prop === 'display') {
        displays.add(value)
      }
    })
  })
  return { baseBackgrounds, darkBackgrounds, displays }
}

export function hasScopedDarkApplyProbeDisplay(
  source: string,
  display: ScopedDarkApplyProbeState['display'],
) {
  try {
    return collectScopedDarkApplyProbeDeclarations(source).displays.has(display)
  }
  catch {
    return false
  }
}

export function hasScopedDarkApplyProbeStyle(source: string, options: ScopedDarkApplyProbeState & {
  staleDarkBackgrounds?: readonly string[] | undefined
}) {
  try {
    const declarations = collectScopedDarkApplyProbeDeclarations(source)
    return declarations.displays.has(options.display)
      && declarations.baseBackgrounds.has('#f1f1f1')
      && declarations.darkBackgrounds.has(options.darkBackground.toLowerCase())
      && (options.staleDarkBackgrounds ?? []).every(
        background => !declarations.darkBackgrounds.has(background.toLowerCase()),
      )
  }
  catch {
    return false
  }
}
