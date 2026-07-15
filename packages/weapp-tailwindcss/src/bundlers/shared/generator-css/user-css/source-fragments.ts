import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import { postcss, removeUnsupportedCascadeLayers } from '@weapp-tailwindcss/postcss'
import { removeUnsupportedMiniProgramAtRules } from '../../css-cleanup'
import { removeTailwindSourceMediaBlocks, terminateTailwindSourceAtRulesBeforeNextDirective } from './at-rules'
import { removeTailwindV4GeneratorAtRulesFallback, TAILWIND_V4_GENERATOR_AT_RULES } from './generated-cleanup'

export function removeTailwindV4GeneratorAtRules(source: string) {
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules((rule) => {
      if (rule.name === 'media' && /^source\(/.test(rule.params.trim())) {
        rule.remove()
        changed = true
        return
      }
      if (!TAILWIND_V4_GENERATOR_AT_RULES.has(rule.name)) {
        return
      }
      rule.remove()
      changed = true
    })
    return changed ? root.toString() : source
  }
  catch {
    return removeTailwindV4GeneratorAtRulesFallback(source)
  }
}

export function isCommentOnlyCss(source: string) {
  try {
    const root = postcss.parse(source)
    return root.nodes.length > 0 && root.nodes.every(node => node.type === 'comment')
  }
  catch {
    return false
  }
}

export function removeMiniProgramHoverSelectors(source: string, enabled: boolean | undefined = true) {
  if (!enabled || !source.includes(':hover')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkRules((rule) => {
      const selectors = rule.selectors ?? [rule.selector]
      const keptSelectors = selectors.filter(selector => !selector.includes(':hover'))
      if (keptSelectors.length === selectors.length) {
        return
      }
      changed = true
      if (keptSelectors.length === 0) {
        rule.remove()
        return
      }
      rule.selectors = keptSelectors
    })
    root.walk((node) => {
      if ('nodes' in node && node.nodes?.length === 0) {
        node.remove()
        changed = true
      }
    })
    return changed ? root.toString() : source
  }
  catch {
    return source
  }
}

export function removeProcessedMiniProgramUnsupportedCss(
  source: string,
  options: Partial<IStyleHandlerOptions>,
) {
  return removeMiniProgramHoverSelectors(
    removeUnsupportedMiniProgramAtRules(source),
    options.cssRemoveHoverPseudoClass,
  )
}

export function unwrapMiniProgramCascadeLayers(source: string) {
  if (!source.includes('@layer')) {
    return source
  }
  try {
    const root = postcss.parse(source)
    removeUnsupportedCascadeLayers(root)
    return root.toString()
  }
  catch {
    return source
  }
}

function hasClassSelector(selector: string) {
  return /(?:^|[^\w-])\.[_a-z\u00A0-\uFFFF\\-]/i.test(selector)
}

export function collectBareSelectorUserCss(source: string) {
  try {
    const root = postcss.parse(source)
    let changed = false
    root.walkAtRules('import', (rule) => {
      rule.remove()
      changed = true
    })
    root.walkRules((rule) => {
      const selectors = rule.selectors?.length ? rule.selectors : [rule.selector]
      if (selectors.some(selector => hasClassSelector(selector))) {
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
    return ''
  }
}

export function stripTailwindSourceMediaFragments(source: string) {
  let removedSourceMediaStart = false
  return terminateTailwindSourceAtRulesBeforeNextDirective(removeTailwindSourceMediaBlocks(source))
    .split(/\r?\n/)
    .filter((line) => {
      if (/^\s*@media\s+source\([^)]*\)\s*\{\s*$/.test(line)) {
        removedSourceMediaStart = true
        return false
      }
      if (/^\s*\}\s*\/\*\s*source\([^)]*\)\s*\*\/\s*$/.test(line)) {
        return false
      }
      if (removedSourceMediaStart && /^\s*\}\s*$/.test(line)) {
        removedSourceMediaStart = false
        return false
      }
      return true
    })
    .join('\n')
}

function stripLeadingTailwindSourceMediaCloseFragment(source: string) {
  return source.replace(/^\s*\}\s*(?:\n|$)/, '')
}

export function stripUnmatchedTailwindSourceMediaCloseFragments(source: string) {
  try {
    postcss.parse(source)
    return source
  }
  catch {
    return stripLeadingTailwindSourceMediaCloseFragment(source)
      .replace(/\s*\}\s*$/, '')
  }
}
