import postcss from 'postcss'

export const TAILWIND_V4_BANNER_RE = /\/\*!\s*tailwindcss v4\./

const GENERATOR_PLACEHOLDER_COMMENT_RE = /^\s*(?:!\s*)?weapp-tailwindcss generator-placeholder\s*$/i

export function hasTailwindcssV4Signal(css: string) {
  if (TAILWIND_V4_BANNER_RE.test(css)) {
    return true
  }
  const root = postcss.parse(css)
  let hasProperty = false
  root.walkAtRules('property', (atRule) => {
    if (atRule.params.trim().startsWith('--tw-')) {
      hasProperty = true
      return false
    }
  })
  return hasProperty
}

export function unwrapTailwindSourceMedia(root: postcss.Root) {
  root.walkAtRules('media', (atRule) => {
    if (!atRule.params.startsWith('source(')) {
      return
    }
    if (atRule.nodes && atRule.nodes.length > 0) {
      atRule.replaceWith(...atRule.nodes)
    }
    else {
      atRule.remove()
    }
  })
}

export function removeTailwindGenerationDirectives(root: postcss.Root) {
  root.walkComments((comment) => {
    if (GENERATOR_PLACEHOLDER_COMMENT_RE.test(comment.text)) {
      comment.remove()
    }
  })
  root.walkAtRules((atRule) => {
    if (
      atRule.name === 'config'
      || atRule.name === 'source'
      || atRule.name === 'tailwind'
      || atRule.name === 'reference'
      || atRule.name === 'plugin'
    ) {
      atRule.remove()
    }
  })
}
