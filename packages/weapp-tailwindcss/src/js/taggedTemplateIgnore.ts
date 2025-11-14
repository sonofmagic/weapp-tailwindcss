import type { Binding, NodePath } from '@babel/traverse'
import type { MemberExpression, Node } from '@babel/types'
import type { NameMatcher } from '@/utils/nameMatcher'

interface TaggedTemplateIgnoreOptions {
  matcher: NameMatcher
  names?: (string | RegExp)[]
}

interface TaggedTemplateIgnore {
  shouldIgnore: (tagPath: NodePath<Node>) => boolean
  getEffectiveTagPath: (tagPath: NodePath<Node>) => NodePath<Node>
}

export function createTaggedTemplateIgnore(
  { matcher, names }: TaggedTemplateIgnoreOptions,
): TaggedTemplateIgnore {
  const bindingIgnoreCache = new Map<Binding, boolean>()
  const taggedTemplateIgnoreCache = new WeakMap<Node, boolean>()
  const canonicalIgnoreNames = new Set(
    (names ?? [])
      .filter((item): item is string => typeof item === 'string'),
  )

  const propertyMatches = (propertyPath: NodePath<Node> | undefined): boolean => {
    if (!propertyPath) {
      return false
    }
    if (propertyPath.isIdentifier()) {
      const { name } = propertyPath.node
      return canonicalIgnoreNames.has(name) || matcher(name)
    }
    if (propertyPath.isStringLiteral()) {
      const { value } = propertyPath.node
      return canonicalIgnoreNames.has(value) || matcher(value)
    }
    return false
  }

  const resolvesMemberExpressionToIgnore = (path: NodePath<MemberExpression>, seen: Set<Binding>): boolean => {
    const propertyPath = path.get('property')
    if (propertyMatches(propertyPath)) {
      return true
    }

    const objectPath = path.get('object')
    if (objectPath.isIdentifier()) {
      // noScope 下可能没有 scope，无法回溯绑定时返回 false
      const scope = (objectPath as any)?.scope
      const binding = scope?.getBinding?.(objectPath.node.name)
      if (binding) {
        return resolvesToWeappTwIgnore(binding, seen)
      }
    }

    return false
  }

  const resolvesToWeappTwIgnore = (binding: Binding, seen: Set<Binding>): boolean => {
    const cached = bindingIgnoreCache.get(binding)
    if (cached !== undefined) {
      return cached
    }

    if (seen.has(binding)) {
      return false
    }
    seen.add(binding)

    let result = false
    const bindingPath = binding.path

    if (bindingPath.isImportSpecifier()) {
      const imported = bindingPath.node.imported
      if (imported.type === 'Identifier' && (canonicalIgnoreNames.has(imported.name) || matcher(imported.name))) {
        result = true
      }
      else if (imported.type === 'StringLiteral' && (canonicalIgnoreNames.has(imported.value) || matcher(imported.value))) {
        result = true
      }
    }
    else if (bindingPath.isVariableDeclarator()) {
      const init = bindingPath.get('init')
      if (init && init.node) {
        if (init.isIdentifier()) {
          const target = (binding as any)?.scope?.getBinding?.(init.node.name)
          if (target) {
            result = resolvesToWeappTwIgnore(target, seen)
          }
        }
        else if (init.isMemberExpression()) {
          result = resolvesMemberExpressionToIgnore(init as NodePath<MemberExpression>, seen)
        }
      }
    }

    bindingIgnoreCache.set(binding, result)
    seen.delete(binding)
    return result
  }

  const getEffectiveTagPath = (tagPath: NodePath<Node>): NodePath<Node> => {
    let current: NodePath<Node> = tagPath
    while (true) {
      if (current.isParenthesizedExpression?.() || current.node.type === 'ParenthesizedExpression') {
        current = current.get('expression') as NodePath<Node>
        continue
      }
      if (current.isTSAsExpression() || current.isTSTypeAssertion()) {
        current = current.get('expression') as NodePath<Node>
        continue
      }
      if (current.isTSNonNullExpression()) {
        current = current.get('expression') as NodePath<Node>
        continue
      }
      if ((current as any).isTypeCastExpression?.()) {
        current = (current as any).get('expression') as NodePath<Node>
        continue
      }
      if (current.isSequenceExpression()) {
        const expressions = current.get('expressions') as NodePath<Node>[]
        const last = expressions[expressions.length - 1]
        if (last) {
          current = last
          continue
        }
      }
      if (current.isCallExpression?.() || current.node.type === 'CallExpression') {
        const callee = current.get('callee') as NodePath<Node>
        current = callee
        continue
      }
      break
    }
    return current
  }

  const evaluateTagPath = (tagPath: NodePath<Node>): boolean => {
    if (tagPath.isCallExpression?.() || tagPath.node.type === 'CallExpression') {
      const calleePath = tagPath.get('callee') as NodePath<Node>
      return evaluateTagPath(calleePath)
    }

    if (tagPath.isIdentifier()) {
      if (matcher(tagPath.node.name)) {
        return true
      }
      const binding = (tagPath as any)?.scope?.getBinding?.(tagPath.node.name)
      if (binding) {
        return resolvesToWeappTwIgnore(binding, new Set())
      }
      return false
    }

    if (tagPath.isMemberExpression()) {
      return resolvesMemberExpressionToIgnore(tagPath as NodePath<MemberExpression>, new Set())
    }

    return false
  }

  const computeIgnore = (tagPath: NodePath<Node>): boolean => {
    const cached = taggedTemplateIgnoreCache.get(tagPath.node)
    if (cached !== undefined) {
      return cached
    }

    const effectiveTagPath = getEffectiveTagPath(tagPath)
    const effectiveCached = taggedTemplateIgnoreCache.get(effectiveTagPath.node)
    if (effectiveCached !== undefined) {
      taggedTemplateIgnoreCache.set(tagPath.node, effectiveCached)
      return effectiveCached
    }

    const result = evaluateTagPath(effectiveTagPath)
    taggedTemplateIgnoreCache.set(effectiveTagPath.node, result)
    taggedTemplateIgnoreCache.set(tagPath.node, result)
    return result
  }

  return {
    shouldIgnore(tagPath: NodePath<Node>) {
      return computeIgnore(tagPath)
    },
    getEffectiveTagPath,
  }
}
