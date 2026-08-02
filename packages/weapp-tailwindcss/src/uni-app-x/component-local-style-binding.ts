import type { ParseResult } from '@babel/parser'
import type { NodePath } from '@babel/traverse'
import type { File, Node } from '@babel/types'
import { traverse } from '@/babel'

const OPTIONS_CLASS_SECTIONS = new Set(['computed', 'methods'])

function readStaticName(path: NodePath<Node>) {
  if (path.isIdentifier()) {
    return path.node.name
  }
  if (path.isStringLiteral()) {
    return path.node.value
  }
  return undefined
}

function isClassBindingName(path: NodePath<Node>, names: Set<string>) {
  const name = readStaticName(path)
  return name !== undefined && names.has(name)
}

function isExportDefaultOptionsObject(path: NodePath<Node> | null | undefined) {
  return path?.isObjectExpression() === true && path.parentPath?.isExportDefaultDeclaration() === true
}

function isOptionsSectionMember(path: NodePath<Node>) {
  const sectionObject = path.parentPath as NodePath<Node> | null
  if (!sectionObject?.isObjectExpression()) {
    return false
  }
  const sectionProperty = sectionObject.parentPath as NodePath<Node> | null
  if (
    !sectionProperty?.isObjectProperty()
    || sectionProperty.get('value').node !== sectionObject.node
  ) {
    return false
  }
  const sectionName = readStaticName(sectionProperty.get('key') as NodePath<Node>)
  return sectionName !== undefined
    && OPTIONS_CLASS_SECTIONS.has(sectionName)
    && isExportDefaultOptionsObject(sectionProperty.parentPath as NodePath<Node> | null)
}

function findContainingFunction(path: NodePath<Node>) {
  let current: NodePath<Node> | null = path
  while (current) {
    if (current.isFunction()) {
      return current
    }
    current = current.parentPath as NodePath<Node> | null
  }
  return undefined
}

function isOptionsDataFunction(path: NodePath<Node> | undefined) {
  if (!path) {
    return false
  }
  if (path.isObjectMethod()) {
    return readStaticName(path.get('key') as NodePath<Node>) === 'data'
      && isExportDefaultOptionsObject(path.parentPath as NodePath<Node> | null)
  }
  if (!path.isFunctionExpression() && !path.isArrowFunctionExpression()) {
    return false
  }
  const property = path.parentPath as NodePath<Node> | null
  return property?.isObjectProperty() === true
    && property.get('value').node === path.node
    && readStaticName(property.get('key') as NodePath<Node>) === 'data'
    && isExportDefaultOptionsObject(property.parentPath as NodePath<Node> | null)
}

function isOptionsDataReturnMember(path: NodePath<Node>) {
  const dataObject = path.parentPath as NodePath<Node> | null
  if (!dataObject?.isObjectExpression()) {
    return false
  }
  const parent = dataObject.parentPath as NodePath<Node> | null
  if (parent?.isReturnStatement()) {
    return isOptionsDataFunction(findContainingFunction(parent))
  }
  if (parent?.isArrowFunctionExpression() && parent.get('body').node === dataObject.node) {
    return isOptionsDataFunction(parent)
  }
  return false
}

function isProgramBinding(path: NodePath<Node>, name: string, declaration?: Node) {
  const binding = path.scope.getBinding(name)
  return binding?.scope.path.isProgram() === true
    && (declaration === undefined || binding.path.node === declaration)
}

function isClassAssignmentTarget(path: NodePath<Node>, names: Set<string>) {
  const directName = readStaticName(path)
  if (directName !== undefined) {
    return names.has(directName) && isProgramBinding(path, directName)
  }
  if (!path.isMemberExpression()) {
    return false
  }
  const object = path.get('object') as NodePath<Node>
  const property = path.get('property') as NodePath<Node>
  return object.isThisExpression() && isClassBindingName(property, names)
}

export function collectClassBindingNames(ast: ParseResult<File>, names: Set<string>) {
  traverse(ast, {
    ReferencedIdentifier(path) {
      names.add(path.node.name)
    },
  })
}

export function collectClassBindingRoots(ast: ParseResult<File>, names: Set<string>) {
  const roots = new WeakSet<Node>()
  if (names.size === 0) {
    return roots
  }
  traverse(ast, {
    Program(path) {
      for (const name of names) {
        const binding = path.scope.getBinding(name)
        if (binding?.scope === path.scope) {
          roots.add(binding.path.node)
        }
      }
    },
    AssignmentExpression(path) {
      if (isClassAssignmentTarget(path.get('left') as NodePath<Node>, names)) {
        roots.add(path.node)
      }
    },
    ObjectMethod(path) {
      if (
        isClassBindingName(path.get('key') as NodePath<Node>, names)
        && isOptionsSectionMember(path as NodePath<Node>)
      ) {
        roots.add(path.node)
      }
    },
    ObjectProperty(path) {
      if (
        isClassBindingName(path.get('key') as NodePath<Node>, names)
        && (
          isOptionsSectionMember(path as NodePath<Node>)
          || isOptionsDataReturnMember(path as NodePath<Node>)
        )
      ) {
        roots.add(path.node)
      }
    },
  })
  return roots
}

export function isClassBindingLiteralPath(path: NodePath<Node>, roots?: WeakSet<Node>) {
  if (!roots) {
    return false
  }
  let current: NodePath<Node> | null = path
  while (current) {
    if (roots.has(current.node)) {
      return true
    }
    current = current.parentPath as NodePath<Node> | null
  }
  return false
}
