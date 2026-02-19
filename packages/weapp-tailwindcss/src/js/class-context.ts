import type { NodePath } from '@babel/traverse'
import type { Node, StringLiteral, TemplateElement } from '@babel/types'

const CLASS_LIKE_KEYWORDS = new Set([
  'class',
  'classname',
  'hoverclass',
  'virtualhostclass',
  'rootclass',
])

const CLASS_HELPER_IDENTIFIERS = new Set([
  'cn',
  'clsx',
  'classnames',
  'twmerge',
  'cva',
  'tv',
  'cx',
  'r',
])

function normalizeKeyword(name: string) {
  return name.replace(/[-_:]/g, '').toLowerCase()
}

function readObjectKeyName(path: NodePath<Node>): string | undefined {
  if (path.isIdentifier()) {
    return path.node.name
  }
  if (path.isStringLiteral()) {
    return path.node.value
  }
  if (path.isTemplateLiteral() && path.node.expressions.length === 0) {
    return path.node.quasis[0]?.value.cooked ?? path.node.quasis[0]?.value.raw
  }
  return undefined
}

function isClassLikeObjectProperty(path: NodePath<Node>, valuePath: NodePath<Node>) {
  if (!path.isObjectProperty()) {
    return false
  }
  if (path.get('value') !== valuePath) {
    return false
  }

  const keyName = readObjectKeyName(path.get('key'))
  if (!keyName) {
    return false
  }

  return CLASS_LIKE_KEYWORDS.has(normalizeKeyword(keyName))
}

function isClassLikeJsxAttribute(path: NodePath<Node>) {
  if (!path.isJSXAttribute()) {
    return false
  }
  const namePath = path.get('name')
  if (!namePath.isJSXIdentifier()) {
    return false
  }
  return CLASS_LIKE_KEYWORDS.has(normalizeKeyword(namePath.node.name))
}

function isClassLikeCallExpression(path: NodePath<Node>, valuePath: NodePath<Node>) {
  if (!path.isCallExpression()) {
    return false
  }

  const args = path.get('arguments')
  if (!args.includes(valuePath)) {
    return false
  }

  const calleePath = path.get('callee')
  if (calleePath.isIdentifier()) {
    return CLASS_HELPER_IDENTIFIERS.has(normalizeKeyword(calleePath.node.name))
  }

  if (calleePath.isMemberExpression()) {
    const propertyPath = calleePath.get('property')
    if (propertyPath.isIdentifier()) {
      return CLASS_HELPER_IDENTIFIERS.has(normalizeKeyword(propertyPath.node.name))
    }
    if (propertyPath.isStringLiteral()) {
      return CLASS_HELPER_IDENTIFIERS.has(normalizeKeyword(propertyPath.node.value))
    }
  }

  return false
}

/**
 * 判断字符串字面量是否处于 class 语义上下文。
 * 仅用于受控兜底场景，避免将普通业务文本误判为 class。
 */
export function isClassContextLiteralPath(path: NodePath<StringLiteral | TemplateElement>) {
  let current: NodePath<Node> = path as unknown as NodePath<Node>

  while (current.parentPath) {
    const parent = current.parentPath as NodePath<Node>

    if (isClassLikeObjectProperty(parent, current)) {
      return true
    }

    if (isClassLikeJsxAttribute(parent)) {
      return true
    }

    if (isClassLikeCallExpression(parent, current)) {
      return true
    }

    current = parent
  }

  return false
}
