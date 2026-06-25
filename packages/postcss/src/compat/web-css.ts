import type { WebCssCompatFeatures, WebCssCompatOptions, WebCssCompatUserOptions } from '../types'
import postcss from 'postcss'
import { normalizeModernColorValue } from './color-mix'
import { removeUnsupportedCascadeLayers } from './mini-program-css/at-rules'

export interface NormalizedWebCssCompatOptions {
  preset: 'off' | 'legacy-web'
  features: Required<WebCssCompatFeatures>
}

const disabledFeatures: Required<WebCssCompatFeatures> = {
  theme: false,
  layer: false,
  property: false,
  oklch: false,
  colorFunctions: false,
  supports: false,
}

const legacyWebFeatures: Required<WebCssCompatFeatures> = {
  theme: true,
  layer: true,
  property: true,
  oklch: true,
  colorFunctions: true,
  supports: true,
}

function normalizeWebCssCompatOptionsObject(options: WebCssCompatOptions): NormalizedWebCssCompatOptions {
  const preset = options.preset ?? 'legacy-web'
  const presetFeatures = preset === 'legacy-web' ? legacyWebFeatures : disabledFeatures
  return {
    preset,
    features: {
      ...presetFeatures,
      ...options.features,
    },
  }
}

export function normalizeWebCssCompatOptions(options: WebCssCompatUserOptions | undefined): NormalizedWebCssCompatOptions {
  if (options === true) {
    return normalizeWebCssCompatOptionsObject({ preset: 'legacy-web' })
  }
  if (!options) {
    return {
      preset: 'off',
      features: disabledFeatures,
    }
  }
  return normalizeWebCssCompatOptionsObject(options)
}

function isWebCssCompatEnabled(options: NormalizedWebCssCompatOptions) {
  return Object.values(options.features).some(Boolean)
}

function collectCustomPropertyValues(root: postcss.Root) {
  const values = new Map<string, string>()
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      values.set(decl.prop, decl.value.trim())
    }
  })
  return values
}

function removeRegisteredCustomProperties(root: postcss.Root) {
  root.walkAtRules('property', (atRule) => {
    atRule.remove()
  })
}

function unwrapThemeAtRules(root: postcss.Root) {
  root.walkAtRules('theme', (atRule) => {
    if (atRule.nodes && atRule.nodes.length > 0) {
      const rootNodes: postcss.ChildNode[] = []
      const hoistedNodes: postcss.ChildNode[] = []
      for (const node of atRule.nodes) {
        if (node.type === 'decl' || node.type === 'comment') {
          rootNodes.push(node.clone())
        }
        else {
          hoistedNodes.push(node.clone())
        }
      }
      const replacements: postcss.ChildNode[] = [
        ...(rootNodes.length > 0
          ? [postcss.rule({
              selector: ':root',
              nodes: rootNodes,
            })]
          : []),
        ...hoistedNodes,
      ]
      atRule.replaceWith(...replacements)
    }
    else {
      atRule.remove()
    }
  })
}

function normalizeModernColorDeclarations(root: postcss.Root, features: Required<WebCssCompatFeatures>) {
  if (!features.oklch && !features.colorFunctions) {
    return
  }
  const customPropertyValues = collectCustomPropertyValues(root)
  root.walkDecls((decl) => {
    const normalized = normalizeModernColorValue(decl.value, customPropertyValues)
    if (!normalized.changed) {
      return
    }
    if (!features.colorFunctions && !/oklch|oklab/i.test(decl.value)) {
      return
    }
    decl.value = normalized.value
  })
}

function removeModernColorSupports(root: postcss.Root) {
  root.walkAtRules('supports', (atRule) => {
    if (!/color-mix|oklch|oklab|lab|lch|display-p3/i.test(atRule.params)) {
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

function removeEmptyAtRules(root: postcss.Root) {
  root.walkAtRules((atRule) => {
    if (atRule.nodes && atRule.nodes.length === 0) {
      atRule.remove()
    }
  })
}

export function transformWebCssCompat(
  css: string,
  options: WebCssCompatUserOptions | undefined,
) {
  const normalized = normalizeWebCssCompatOptions(options)
  if (!isWebCssCompatEnabled(normalized)) {
    return css
  }

  try {
    const root = postcss.parse(css)
    if (normalized.features.theme) {
      unwrapThemeAtRules(root)
    }
    if (normalized.features.layer) {
      removeUnsupportedCascadeLayers(root)
    }
    if (normalized.features.property) {
      removeRegisteredCustomProperties(root)
    }
    if (normalized.features.supports) {
      removeModernColorSupports(root)
    }
    normalizeModernColorDeclarations(root, normalized.features)
    removeEmptyAtRules(root)
    return root.toString()
  }
  catch {
    return css
  }
}
