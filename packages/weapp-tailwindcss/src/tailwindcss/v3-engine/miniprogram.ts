import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { TailwindV3GenerateTarget } from './types'
import { createStyleHandler } from '@weapp-tailwindcss/postcss'
import postcss from 'postcss'
import { pruneMiniProgramGeneratedCss } from '../miniprogram'

const defaultStyleHandler = createStyleHandler({
  cssChildCombinatorReplaceValue: ['view', 'text'],
  cssRemoveHoverPseudoClass: true,
  isMainChunk: true,
  majorVersion: 3,
})
const MINI_PROGRAM_V3_PREFLIGHT_SELECTOR = 'view,text,::before,::after'
const V3_PREFLIGHT_RESET_PROPS = new Set([
  'box-sizing',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'margin',
  'padding',
])

function normalizeSelector(selector: string) {
  return selector.trim().replace(/\s+/g, '')
}

function isMiniProgramV3PreflightRule(rule: postcss.Rule) {
  return normalizeSelector(rule.selector) === MINI_PROGRAM_V3_PREFLIGHT_SELECTOR
}

function hasResetDeclaration(rule: postcss.Rule) {
  let found = false
  rule.walkDecls((decl) => {
    if (V3_PREFLIGHT_RESET_PROPS.has(decl.prop)) {
      found = true
    }
  })
  return found
}

function createPreflightDeclarations(cssPreflight: IStyleHandlerOptions['cssPreflight']) {
  if (!cssPreflight || typeof cssPreflight !== 'object') {
    return []
  }
  return Object.entries(cssPreflight)
    .filter((entry): entry is [string, string | number | boolean] => entry[1] !== false)
    .map(([prop, value]) => postcss.decl({
      prop,
      value: value.toString(),
    }))
}

function ensureMiniProgramV3PreflightReset(css: string, cssPreflight: IStyleHandlerOptions['cssPreflight']) {
  const declarations = createPreflightDeclarations(cssPreflight)
  if (declarations.length === 0) {
    return css
  }

  try {
    const root = postcss.parse(css)
    let targetRule: postcss.Rule | undefined
    let hasReset = false

    root.walkRules((rule) => {
      if (!isMiniProgramV3PreflightRule(rule)) {
        return
      }
      targetRule ??= rule
      if (hasResetDeclaration(rule)) {
        hasReset = true
      }
    })

    if (!targetRule || hasReset) {
      return css
    }

    targetRule.append(...declarations.map(decl => decl.clone()))
    return root.toString()
  }
  catch {
    return css
  }
}

export async function transformTailwindV3CssToWeapp(
  css: string,
  options?: Partial<IStyleHandlerOptions>,
) {
  const result = await defaultStyleHandler(css, {
    cssChildCombinatorReplaceValue: ['view', 'text'],
    cssRemoveHoverPseudoClass: true,
    ...options,
    isMainChunk: true,
    majorVersion: 3,
  })
  const prunedCss = pruneMiniProgramGeneratedCss(result.css, {
    preservePreflight: true,
  })
  return ensureMiniProgramV3PreflightReset(prunedCss, options?.cssPreflight)
}

export async function transformTailwindV3CssByTarget(
  css: string,
  target: TailwindV3GenerateTarget,
  options?: Partial<IStyleHandlerOptions>,
) {
  return target === 'weapp'
    ? transformTailwindV3CssToWeapp(css, options)
    : css
}
