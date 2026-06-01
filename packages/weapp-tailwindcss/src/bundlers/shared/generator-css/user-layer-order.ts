import postcss from 'postcss'

const USER_LAYER_COMPONENTS_START = '/*! weapp-tailwindcss layer components start */'
const USER_LAYER_COMPONENTS_END = '/*! weapp-tailwindcss layer components end */'
const UTILITY_LAYER_INSERTION_RES = [
  /(^|\n)\.(?:fixed|absolute|relative|sticky|static)\s*\{/,
  /(^|\n)\.(?:block|inline-block|inline|flex|inline-flex|grid|hidden)\s*\{/,
  /(^|\n)\.(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-/,
  /(^|\n)\.(?:w|h|min-w|min-h|max-w|max-h)-/,
  /(^|\n)\.(?:bg|text|border|rounded|shadow|opacity|transition|transform|translate|scale|rotate|gap|items|justify|content)-/,
]

function appendCss(base: string, extra: string) {
  if (!base) {
    return extra
  }
  if (!extra) {
    return base
  }
  if (/\s$/.test(base) || /^\s/.test(extra)) {
    return `${base}${extra}`
  }
  return `${base}\n${extra}`
}

function removeFirstCssOccurrence(css: string, chunk: string) {
  const trimmed = chunk.trim()
  if (!trimmed) {
    return css
  }
  const index = css.indexOf(trimmed)
  if (index === -1) {
    return css
  }
  return appendCss(css.slice(0, index).trimEnd(), css.slice(index + trimmed.length).trimStart())
}

function collectSelectorsFromCss(css: string) {
  const selectors = new Set<string>()
  try {
    postcss.parse(css).walkRules((rule) => {
      for (const selector of rule.selectors ?? [rule.selector]) {
        const normalized = selector.trim()
        if (normalized) {
          selectors.add(normalized)
        }
      }
    })
  }
  catch {
  }
  return selectors
}

function matchesLayerSelector(selector: string, layerSelector: string) {
  if (selector === layerSelector) {
    return true
  }
  if (!selector.startsWith(layerSelector)) {
    return false
  }
  const next = selector[layerSelector.length]
  return next === ':' || next === '['
}

function removeCssRulesForSelectors(css: string, layerCss: string) {
  const selectors = [...collectSelectorsFromCss(layerCss)]
  if (selectors.length === 0) {
    return css
  }
  try {
    const root = postcss.parse(css)
    root.walkRules((rule) => {
      const ruleSelectors = rule.selectors ?? [rule.selector]
      if (ruleSelectors.some(selector => selectors.some(layerSelector => matchesLayerSelector(selector.trim(), layerSelector)))) {
        rule.remove()
      }
    })
    return root.toString()
  }
  catch {
    return removeFirstCssOccurrence(css, layerCss)
  }
}

export function wrapUserLayerComponentsCss(css: string) {
  return css.trim().length > 0
    ? `${USER_LAYER_COMPONENTS_START}\n${css}\n${USER_LAYER_COMPONENTS_END}`
    : css
}

export function extractMarkedUserLayerComponentsCss(css: string) {
  const layers: string[] = []
  let rest = ''
  let cursor = 0

  while (cursor < css.length) {
    const startIndex = css.indexOf(USER_LAYER_COMPONENTS_START, cursor)
    if (startIndex === -1) {
      rest += css.slice(cursor)
      break
    }

    rest += css.slice(cursor, startIndex)
    const contentStart = startIndex + USER_LAYER_COMPONENTS_START.length
    const endIndex = css.indexOf(USER_LAYER_COMPONENTS_END, contentStart)
    if (endIndex === -1) {
      rest += css.slice(startIndex)
      break
    }

    const layerCss = css.slice(contentStart, endIndex).trim()
    if (layerCss) {
      layers.push(layerCss)
    }
    cursor = endIndex + USER_LAYER_COMPONENTS_END.length
  }

  return {
    layers,
    rest,
  }
}

function findUtilityLayerInsertionIndex(css: string) {
  let index = -1
  for (const pattern of UTILITY_LAYER_INSERTION_RES) {
    const match = pattern.exec(css)
    if (!match) {
      continue
    }
    const nextIndex = match.index + (match[1]?.length ?? 0)
    index = index === -1 ? nextIndex : Math.min(index, nextIndex)
  }
  return index
}

export function reorderMarkedUserLayerComponentsCss(css: string) {
  if (!css.includes(USER_LAYER_COMPONENTS_START)) {
    return css
  }

  const { layers, rest } = extractMarkedUserLayerComponentsCss(css)
  if (layers.length === 0) {
    return rest
  }

  const layerCss = layers.join('\n')
  const insertionIndex = findUtilityLayerInsertionIndex(rest)
  if (insertionIndex === -1) {
    return appendCss(rest, layerCss)
  }

  return appendCss(
    appendCss(rest.slice(0, insertionIndex), layerCss),
    rest.slice(insertionIndex),
  )
}

export function mergeMarkedUserLayerComponentsCss(baseCss: string, markedCss: string) {
  if (!markedCss.includes(USER_LAYER_COMPONENTS_START)) {
    return {
      css: baseCss,
      merged: false,
    }
  }

  const { layers } = extractMarkedUserLayerComponentsCss(markedCss)
  if (layers.length === 0) {
    return {
      css: baseCss,
      merged: false,
    }
  }

  const layerCss = layers.join('\n')
  const baseWithoutLayers = removeCssRulesForSelectors(baseCss, layerCss)
  return {
    css: reorderMarkedUserLayerComponentsCss(appendCss(baseWithoutLayers, wrapUserLayerComponentsCss(layerCss))),
    merged: true,
  }
}
