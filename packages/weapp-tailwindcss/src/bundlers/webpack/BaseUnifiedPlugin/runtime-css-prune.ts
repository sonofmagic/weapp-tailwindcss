import type { ITemplateHandlerOptions } from '@/types'
import postcss from 'postcss'
import { replaceWxml } from '@/wxml'

const ESCAPED_RUNTIME_CLASS_RE = /(?:^|[_-])[bdqpcmh](?:[_-]|$)/i
const SELECTOR_CLASS_RE = /\.([^\s>+~:[.#]+)/g

function resolveEscapedRuntimeSet(
  runtimeSet: Set<string>,
  options?: Pick<ITemplateHandlerOptions, 'escapeMap'>,
) {
  const escapedRuntimeSet = new Set<string>()
  for (const candidate of runtimeSet) {
    escapedRuntimeSet.add(replaceWxml(candidate, options))
  }
  return escapedRuntimeSet
}

function isPrunableRuntimeClassName(
  className: string,
  escapedRuntimeSet: Set<string>,
  preservedClasses?: ReadonlySet<string>,
) {
  if (!className) {
    return false
  }

  if (preservedClasses?.has(className)) {
    return false
  }

  if (escapedRuntimeSet.has(className)) {
    return false
  }

  if (!ESCAPED_RUNTIME_CLASS_RE.test(className) && !className.includes('-')) {
    return false
  }

  return true
}

function hasPrunableClassName(
  selector: string,
  escapedRuntimeSet: Set<string>,
  preservedClasses?: ReadonlySet<string>,
) {
  const normalized = selector.trim()
  if (!normalized.includes('.')) {
    return false
  }
  SELECTOR_CLASS_RE.lastIndex = 0
  let matched = SELECTOR_CLASS_RE.exec(normalized)
  while (matched) {
    if (isPrunableRuntimeClassName(matched[1], escapedRuntimeSet, preservedClasses)) {
      return true
    }
    matched = SELECTOR_CLASS_RE.exec(normalized)
  }
  return false
}

export function pruneStaleRuntimeCss(
  rawCss: string,
  runtimeSet: Set<string>,
  options?: Pick<ITemplateHandlerOptions, 'escapeMap'>,
  preservedClasses?: ReadonlySet<string>,
) {
  if (runtimeSet.size === 0) {
    return rawCss
  }

  const root = postcss.parse(rawCss)
  const escapedRuntimeSet = resolveEscapedRuntimeSet(runtimeSet, options)
  let changed = false

  root.walkRules((rule) => {
    const keptSelectors = rule.selectors.filter((selector) => {
      if (!hasPrunableClassName(selector, escapedRuntimeSet, preservedClasses)) {
        return true
      }
      changed = true
      return false
    })

    if (keptSelectors.length === 0) {
      changed = true
      rule.remove()
      return
    }

    if (keptSelectors.length !== rule.selectors.length) {
      changed = true
      rule.selectors = keptSelectors
    }
  })

  return changed ? root.toString() : rawCss
}
