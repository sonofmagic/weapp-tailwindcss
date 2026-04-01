import type { AttributeNode, DirectiveNode, ElementNode } from '@vue/compiler-dom'
import { NodeTypes } from '@vue/compiler-dom'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'

type SupportedSpaceAxis = 'x' | 'y'
const NEGATIVE_SPACE_RE = /^-(space-[xy])-(.+)$/
const POSITIVE_SPACE_RE = /^space-([xy])-(.+)$/
const SPACE_X_UTILITY_RE = /^-?space-x-/
const SPACE_Y_UTILITY_RE = /^-?space-y-/

interface SupportedSpaceUtility {
  axis: SupportedSpaceAxis
  utility: string
  negative: boolean
  suffix: string
}

function createStableHash(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function createAlias(fileId: string, utility: string, index: number) {
  return `wts-${createStableHash(`${fileId}:${utility}`)}-${index.toString(36)}`
}

function resolveSpaceUtility(candidate: string): SupportedSpaceUtility | undefined {
  const negativeMatch = candidate.match(NEGATIVE_SPACE_RE)
  if (negativeMatch) {
    const axis = negativeMatch[1] === 'space-x' ? 'x' : 'y'
    const suffix = negativeMatch[2]
    return {
      axis,
      utility: candidate,
      negative: true,
      suffix,
    }
  }

  const match = candidate.match(POSITIVE_SPACE_RE)
  if (!match) {
    return
  }

  const axis = match[1] as SupportedSpaceAxis
  const suffix = match[2]
  return {
    axis,
    utility: candidate,
    negative: false,
    suffix,
  }
}

function getReverseToken(axis: SupportedSpaceAxis) {
  return axis === 'x' ? 'space-x-reverse' : 'space-y-reverse'
}

function hasSpaceUtility(tokens: string[], axis: SupportedSpaceAxis) {
  const re = axis === 'x' ? SPACE_X_UTILITY_RE : SPACE_Y_UTILITY_RE
  return tokens.some(item => re.test(item) && item !== getReverseToken(axis))
}

function toApplyUtility(space: SupportedSpaceUtility, reversed: boolean) {
  const prefix = reversed
    ? (space.axis === 'x' ? 'mr' : 'mb')
    : (space.axis === 'x' ? 'ml' : 'mt')
  return `${space.negative ? '-' : ''}${prefix}-${space.suffix}`
}

function appendClassNames(base: string, extra: string[]) {
  const next = [...splitCode(base), ...extra]
  return next.join(' ').trim()
}

function getStaticClassAttribute(node: ElementNode) {
  return node.props.find(
    (prop): prop is AttributeNode => prop.type === NodeTypes.ATTRIBUTE && prop.name.toLowerCase() === 'class',
  )
}

function getDynamicClassDirective(node: ElementNode) {
  return node.props.find(
    (prop): prop is DirectiveNode =>
      prop.type === NodeTypes.DIRECTIVE
      && prop.name === 'bind'
      && prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION
      && prop.arg.isStatic
      && prop.arg.content.toLowerCase() === 'class'
      && prop.exp?.type === NodeTypes.SIMPLE_EXPRESSION,
  )
}

function getDirectChildElements(node: ElementNode) {
  return node.children.filter(
    (child): child is ElementNode => child.type === NodeTypes.ELEMENT,
  )
}

export class UniAppXSpaceStyleCollector {
  private aliasByUtility = new Map<string, string>()
  private applyByAlias = new Map<string, string>()
  private staticClassRewrite = new Map<AttributeNode, string>()
  private directiveExpressionRewrite = new Map<DirectiveNode, string>()
  private insertedClassByElement = new Map<ElementNode, string>()

  constructor(private readonly fileId: string) {}

  private ensureAlias(utility: SupportedSpaceUtility) {
    const cached = this.aliasByUtility.get(utility.utility)
    if (cached) {
      return cached
    }
    const alias = createAlias(this.fileId, utility.utility, this.aliasByUtility.size)
    this.aliasByUtility.set(utility.utility, alias)
    this.applyByAlias.set(alias, utility.suffix)
    return alias
  }

  private appendAliasToChild(node: ElementNode, aliases: string[]) {
    if (aliases.length === 0) {
      return
    }

    const staticClass = getStaticClassAttribute(node)
    if (staticClass?.value) {
      this.staticClassRewrite.set(staticClass, appendClassNames(staticClass.value.content, aliases))
      return
    }

    const dynamicClass = getDynamicClassDirective(node)
    if (dynamicClass?.exp?.type === NodeTypes.SIMPLE_EXPRESSION) {
      const aliasLiteral = aliases.join(' ')
      this.directiveExpressionRewrite.set(dynamicClass, `[${dynamicClass.exp.content}, '${aliasLiteral}']`)
      return
    }

    this.insertedClassByElement.set(node, aliases.join(' '))
  }

  collect(node: ElementNode) {
    const classAttr = getStaticClassAttribute(node)
    if (!classAttr?.value) {
      return
    }

    const tokens = splitCode(classAttr.value.content)
    if (tokens.length === 0) {
      return
    }

    const reverseAxisSet = new Set<SupportedSpaceAxis>()
    for (const token of tokens) {
      if (token === 'space-x-reverse') {
        reverseAxisSet.add('x')
      }
      else if (token === 'space-y-reverse') {
        reverseAxisSet.add('y')
      }
    }

    const spaceUtilities: SupportedSpaceUtility[] = []
    const nextTokens: string[] = []
    for (const token of tokens) {
      const utility = resolveSpaceUtility(token)
      if (utility) {
        spaceUtilities.push(utility)
      }
      else if (token === 'space-x-reverse' && hasSpaceUtility(tokens, 'x')) {
        continue
      }
      else if (token === 'space-y-reverse' && hasSpaceUtility(tokens, 'y')) {
        continue
      }
      else {
        nextTokens.push(token)
      }
    }

    if (spaceUtilities.length === 0) {
      return
    }

    const children = getDirectChildElements(node)
    if (children.length <= 1) {
      this.staticClassRewrite.set(classAttr, nextTokens.join(' '))
      return
    }

    const aliases = spaceUtilities.map((utility) => {
      const reversed = reverseAxisSet.has(utility.axis)
      return this.ensureAlias({
        ...utility,
        utility: reversed ? `${utility.utility}:${getReverseToken(utility.axis)}` : utility.utility,
        suffix: toApplyUtility(utility, reversed),
      })
    })
    for (const child of children.slice(1)) {
      this.appendAliasToChild(child, aliases)
    }
    this.staticClassRewrite.set(classAttr, nextTokens.join(' '))
  }

  getStaticClassRewrite(prop: AttributeNode) {
    return this.staticClassRewrite.get(prop)
  }

  getDirectiveExpressionRewrite(prop: DirectiveNode) {
    return this.directiveExpressionRewrite.get(prop)
  }

  getInsertedClass(node: ElementNode) {
    return this.insertedClassByElement.get(node)
  }

  hasStyles() {
    return this.applyByAlias.size > 0
  }

  toStyleBlock() {
    if (!this.hasStyles()) {
      return ''
    }
    const lines = ['<style scoped>']
    for (const [alias, utility] of this.applyByAlias) {
      lines.push(`.${alias} {`)
      lines.push(`  @apply ${utility};`)
      lines.push('}')
    }
    lines.push('</style>')
    return `${lines.join('\n')}\n`
  }
}
