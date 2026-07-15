import { postcss } from '@weapp-tailwindcss/postcss'

export const TAILWIND_V4_GENERATOR_AT_RULES = new Set([
  'config',
  'custom-variant',
  'plugin',
  'source',
  'theme',
  'utility',
  'variant',
])

export function removeBalancedAtRuleBlock(source: string, atRuleStart: number) {
  const blockStart = source.indexOf('{', atRuleStart)
  if (blockStart === -1) {
    const semicolon = source.indexOf(';', atRuleStart)
    return semicolon === -1 ? source.slice(0, atRuleStart) : `${source.slice(0, atRuleStart)}${source.slice(semicolon + 1)}`
  }
  let depth = 0
  for (let index = blockStart; index < source.length; index++) {
    const char = source[index]
    if (char === '{') {
      depth++
      continue
    }
    if (char !== '}') {
      continue
    }
    depth--
    if (depth === 0) {
      return `${source.slice(0, atRuleStart)}${source.slice(index + 1)}`
    }
  }
  return source.slice(0, atRuleStart)
}

export function removeTailwindV4GeneratorAtRulesFallback(source: string) {
  let next = source
  let changed = false
  const sourceMediaRE = /@media\s+source\([^)]*\)\s*\{/g
  for (;;) {
    sourceMediaRE.lastIndex = 0
    const match = sourceMediaRE.exec(next)
    if (!match) {
      break
    }
    next = removeBalancedAtRuleBlock(next, match.index)
    changed = true
  }
  const atRuleRE = /@(?:config|custom-variant|plugin|source|theme|utility|variant)\b/g
  for (;;) {
    atRuleRE.lastIndex = 0
    const match = atRuleRE.exec(next)
    if (!match) {
      break
    }
    next = removeBalancedAtRuleBlock(next, match.index)
    changed = true
  }
  return changed ? next : source
}

function isTailwindGeneratedPreflightComment(text: string) {
  return text.includes('cssremedy')
    || text.includes('Use the user\'s configured')
    || text.includes('tailwindlabs/tailwindcss')
    || text.includes('Prevent padding and border from affecting element width')
    || text.includes('Remove default margins and padding')
    || text.includes('Deprecated')
    || text.includes('Reset all borders')
    || text.includes('Add the correct text decoration')
    || text.includes('Make elements with the HTML hidden attribute stay hidden')
    || text.includes('Inherit font styles in all browsers')
    || text.includes('Add the correct height in Firefox')
    || text.includes('Remove the default font size and weight for headings')
    || text.includes('Reset links to optimize for opt-in styling')
    || text.includes('Add the correct font weight in Edge and Safari')
    || text.includes('Use the user\'s configured `mono` font-family')
    || text.includes('Add the correct font size in all browsers')
    || text.includes('Prevent `sub` and `sup` elements from affecting the line height')
    || text.includes('Remove text indentation from table contents')
    || text.includes('Use the modern Firefox focus style')
    || text.includes('Add the correct vertical alignment')
    || text.includes('Add the correct display')
    || text.includes('Make lists unstyled by default')
    || text.includes('Make replaced elements `display: block` by default')
    || text.includes('Constrain images and videos to the parent width')
    || text.includes('Restore default font weight')
    || text.includes('Restore indentation')
    || text.includes('Restore space after button')
    || text.includes('Prevent resizing textareas horizontally')
    || text.includes('Remove the inner padding in Chrome and Safari')
    || text.includes('Ensure date/time inputs have the same height')
    || text.includes('Prevent height from changing on date/time inputs')
    || text.includes('Remove excess padding from pseudo-elements')
    || text.includes('Center dropdown marker shown on inputs')
    || text.includes('Remove the additional `:invalid` styles')
    || text.includes('Correct the inability to style the border radius')
    || text.includes('Correct the cursor style of increment and decrement buttons')
}

const TAILWIND_GENERATED_THEME_SCOPE_SELECTORS = new Set([
  ':host',
  ':root',
  'page',
  '.tw-root',
  'wx-root-portal-content',
])

function isTailwindGeneratedThemeScopeSelector(selector: string) {
  const selectors = selector
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  const selectorSet = new Set(selectors)
  if (selectorSet.size !== selectors.length) {
    return false
  }
  if (!selectors.every(item => TAILWIND_GENERATED_THEME_SCOPE_SELECTORS.has(item))) {
    return false
  }
  return (
    selectorSet.size === 2
    && selectorSet.has(':root')
    && selectorSet.has(':host')
  ) || (
    selectorSet.size === 4
    && selectorSet.has(':host')
    && selectorSet.has('page')
    && selectorSet.has('.tw-root')
    && selectorSet.has('wx-root-portal-content')
  )
}

function isTailwindGeneratedThemeRule(selector: string, node: { nodes?: any[] | undefined }) {
  if (!isTailwindGeneratedThemeScopeSelector(selector)) {
    return false
  }
  return node.nodes?.some(child => child.type === 'decl' && /^--(?:color|spacing|text|font|default|radius|tw-)/.test(child.prop)) ?? false
}

function isTailwindGeneratedPreflightRule(selector: string, node: { nodes?: any[] | undefined }) {
  if (
    selector === 'view,text,::after,::before'
    || selector === 'view, text, ::after, ::before'
    || selector === '*'
    || selector === '::after'
    || selector === '::before'
    || selector === '::backdrop'
    || selector === ':host'
    || selector === '[hidden]:not([hidden="until-found"])'
    || selector === '[hidden]:not([hidden=\'until-found\'])'
    || selector === 'button,input[type="button"],input[type="reset"],input[type="submit"]'
    || selector === 'button, input[type="button"], input[type="reset"], input[type="submit"]'
    || selector === 'button,input[type=\'button\'],input[type=\'reset\'],input[type=\'submit\']'
    || selector === 'button, input[type=\'button\'], input[type=\'reset\'], input[type=\'submit\']'
  ) {
    return true
  }
  if (selector === 'abbr[title]') {
    return node.nodes?.some(child => child.type === 'decl' && child.prop === 'text-decoration') ?? false
  }
  if (selector === ':host') {
    return node.nodes?.some(child => child.type === 'decl' && child.value?.includes('--theme(')) ?? false
  }
  return false
}

export function removeTailwindV4GeneratedUserCssArtifacts(source: string) {
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkComments((comment) => {
      if (!isTailwindGeneratedPreflightComment(comment.text)) {
        return
      }
      comment.remove()
      changed = true
    })
    root.walkRules((rule) => {
      const selector = rule.selector.replace(/\s+/g, ' ').trim()
      if (
        isTailwindGeneratedThemeRule(selector, rule)
        || isTailwindGeneratedPreflightRule(selector, rule)
      ) {
        rule.remove()
        changed = true
      }
    })
    root.walkAtRules((rule) => {
      if (rule.nodes !== undefined && rule.nodes.length === 0) {
        rule.remove()
        changed = true
      }
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}
