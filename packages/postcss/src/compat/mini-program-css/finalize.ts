import type { FinalizeMiniProgramCssOptions } from './finalize-options'
import postcss from 'postcss'
import { normalizeMiniProgramPrefixedDeclaration, removeUnsupportedMiniProgramPrefixedAtRule } from '../mini-program-prefixes'
import { appendTailwindcssV4MiniProgramGradientRules, collectUsedTailwindcssV4Variables, createMissingCssVarsV4Nodes, mergeTailwindcssV4GradientDirectionRules, normalizeTailwindcssV4Declaration } from '../tailwindcss-v4'
import { removeUnsupportedCascadeLayers, removeUnsupportedMiniProgramAtRules } from './at-rules'
import {
  hasTailwindcssV4Signal,
  removeTailwindGenerationDirectives,
  TAILWIND_V4_BANNER_RE,
  unwrapTailwindSourceMedia,
} from './directives'
import { createHoistInsertionAnchor, insertHoistedRules, mergeEquivalentHoistedRules } from './hoist'
import { collectPreflightRules, createPreflightResetRule } from './preflight'
import {
  removeDisplayP3Declarations,
  removeEmptyAtRules,
  removeRootSpecificityPlaceholders,
  removeSpecificityPlaceholders,
  removeSpecificityPlaceholdersFromSource,
  removeTailwindContainerMaxWidthMediaRules,
  removeTailwindContainerWidthRules,
  removeUnsupportedBrowserSelectors,
  removeUnsupportedModernColorDeclarations,
} from './root-cleanups'
import { MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR } from './selectors'
import { collectThemeVariableRule } from './theme'

export type { FinalizeMiniProgramCssOptions } from './finalize-options'
export { insertHoistedRules } from './hoist'
export { collectPreflightRules } from './preflight'

function finalizeMiniProgramCssRoot(root: postcss.Root, options: FinalizeMiniProgramCssOptions = {}) {
  const shouldInjectTailwindcssV4Defaults = options.isTailwindcssV4 === true
  const tailwindcssV4DefaultNodes = shouldInjectTailwindcssV4Defaults
    ? createMissingCssVarsV4Nodes(root, collectUsedTailwindcssV4Variables(root))
    : []
  removeUnsupportedCascadeLayers(root)
  unwrapTailwindSourceMedia(root)
  removeTailwindGenerationDirectives(root)
  root.walkAtRules('property', (atRule) => {
    atRule.remove()
  })
  removeSpecificityPlaceholders(root)
  removeRootSpecificityPlaceholders(root)
  removeUnsupportedBrowserSelectors(root)
  removeDisplayP3Declarations(root)
  removeTailwindContainerMaxWidthMediaRules(root)
  removeTailwindContainerWidthRules(root, { generatedOnly: true })
  removeUnsupportedModernColorDeclarations(root)
  root.walkDecls((decl) => {
    if (shouldInjectTailwindcssV4Defaults) {
      normalizeTailwindcssV4Declaration(decl)
    }
    normalizeMiniProgramPrefixedDeclaration(decl)
  })
  root.walkAtRules((atRule) => {
    removeUnsupportedMiniProgramPrefixedAtRule(atRule)
  })
  if (shouldInjectTailwindcssV4Defaults) {
    mergeTailwindcssV4GradientDirectionRules(root)
    if (options.tailwindcssV4GradientFallback === true) {
      appendTailwindcssV4MiniProgramGradientRules(root)
    }
  }

  const hoistAnchor = createHoistInsertionAnchor(root)
  const preflightRules = collectPreflightRules(root, options)
  if (preflightRules.length === 0) {
    const resetRule = createPreflightResetRule(options.cssPreflight)
    if (resetRule) {
      preflightRules.push(resetRule)
    }
  }
  if (tailwindcssV4DefaultNodes.length > 0) {
    preflightRules.push(postcss.rule({
      selector: MINI_PROGRAM_ELEMENT_SCOPE_SELECTOR,
      nodes: tailwindcssV4DefaultNodes,
    }))
  }
  const themeRule = collectThemeVariableRule(root, options)
  const hoistedRules = themeRule ? [...preflightRules, themeRule] : preflightRules
  insertHoistedRules(root, mergeEquivalentHoistedRules(hoistedRules), hoistAnchor)
  removeEmptyAtRules(root)
}

export function hoistTailwindPreflightBase(css: string) {
  try {
    const root = postcss.parse(css)
    const preflightRules = collectPreflightRules(root)
    insertHoistedRules(root, preflightRules)
    return root.toString()
  }
  catch {
    return css
  }
}

export function finalizeMiniProgramCss(css: string, options: FinalizeMiniProgramCssOptions = {}) {
  let isTailwindcssV4 = options.isTailwindcssV4
  if (isTailwindcssV4 === undefined) {
    try {
      isTailwindcssV4 = hasTailwindcssV4Signal(css)
    }
    catch {
      isTailwindcssV4 = TAILWIND_V4_BANNER_RE.test(css)
    }
  }
  const cleanedCss = removeUnsupportedMiniProgramAtRules(css)
  try {
    const root = postcss.parse(cleanedCss)
    finalizeMiniProgramCssRoot(root, { ...options, isTailwindcssV4 })
    return root.toString()
  }
  catch {
    return removeSpecificityPlaceholdersFromSource(cleanedCss)
  }
}
