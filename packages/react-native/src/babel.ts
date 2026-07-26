/* eslint-disable style/max-statements-per-line */

import type { PluginObject, PluginPass } from '@babel/core'
import type { NodePath } from '@babel/traverse'
import * as t from '@babel/types'

export interface WeappReactNativeBabelOptions {
  classNameSet?: Iterable<string> | undefined
  runtimeModule?: string | undefined
}

interface PluginState extends PluginPass {
  opts: WeappReactNativeBabelOptions
  runtimeIdentifier?: t.Identifier
  virtualImported?: boolean
}

function classTokens(value: string) {
  return value.split(/\s+/).filter(Boolean)
}

function ensureRuntimeIdentifier(program: NodePath<t.Program>, state: PluginState) {
  if (state.runtimeIdentifier) { return state.runtimeIdentifier }
  const identifier = program.scope.generateUidIdentifier('tw')
  const moduleName = state.opts.runtimeModule ?? '@weapp-tailwindcss/react-native/runtime'
  if (!state.virtualImported) {
    program.unshiftContainer('body', t.importDeclaration([], t.stringLiteral('@weapp-tailwindcss/react-native/virtual')))
    state.virtualImported = true
  }
  program.unshiftContainer('body', t.importDeclaration([
    t.importSpecifier(identifier, t.identifier('tw')),
  ], t.stringLiteral(moduleName)))
  state.runtimeIdentifier = identifier
  return identifier
}

function shouldSkipFile(filename: string | undefined) {
  if (!filename) { return false }
  const normalized = filename.replaceAll('\\', '/')
  const basename = normalized.slice(normalized.lastIndexOf('/') + 1).toLowerCase()
  return normalized.includes('/node_modules/')
    || /^(?:react|react-native)(?:[.-]|$)/.test(basename)
}

function hasKnownStaticTokens(value: string, classNameSet: Set<string> | undefined) {
  if (!classNameSet) { return false }
  return classTokens(value).every(token => classNameSet.has(token))
}

function callRuntime(program: NodePath<t.Program>, state: PluginState, value: t.Expression | t.StringLiteral) {
  return t.callExpression(ensureRuntimeIdentifier(program, state), [value])
}

function styleExpression(attribute: t.JSXAttribute) {
  const value = attribute.value
  if (!value) { return undefined }
  if (t.isJSXExpressionContainer(value)) {
    return t.isJSXEmptyExpression(value.expression) ? undefined : value.expression as t.Expression
  }
  if (t.isStringLiteral(value)) { return value }
  return undefined
}

function applyStyleAttribute(
  opening: NodePath<t.JSXOpeningElement>,
  expression: t.Expression,
) {
  const existing = opening.node.attributes.find(attribute => t.isJSXAttribute(attribute) && attribute.name.name === 'style')
  if (existing && t.isJSXAttribute(existing)) {
    const current = styleExpression(existing)
    existing.value = t.jsxExpressionContainer(current ? t.arrayExpression([current, expression]) : expression)
    return
  }
  opening.node.attributes.push(t.jsxAttribute(t.jsxIdentifier('style'), t.jsxExpressionContainer(expression)))
}

function propertyName(node: t.ObjectProperty) {
  if (t.isIdentifier(node.key) && !node.computed) { return node.key.name }
  if (t.isStringLiteral(node.key)) { return node.key.value }
  return undefined
}

function applyCreateElementProps(props: t.ObjectExpression, program: NodePath<t.Program>, state: PluginState) {
  const classProperty = props.properties.find(property => t.isObjectProperty(property) && propertyName(property) === 'className')
  if (!classProperty || !t.isObjectProperty(classProperty)) { return }
  const value = classProperty.value
  const classSet = state.opts.classNameSet ? new Set(state.opts.classNameSet) : undefined
  if (t.isStringLiteral(value)) {
    if (!hasKnownStaticTokens(value.value, classSet)) { return }
    const styleProperty = props.properties.find(property => t.isObjectProperty(property) && propertyName(property) === 'style')
    const styleExpression = styleProperty && t.isObjectProperty(styleProperty) ? styleProperty.value : undefined
    const nextStyle = styleExpression ? t.arrayExpression([styleExpression, callRuntime(program, state, value)]) : callRuntime(program, state, value)
    if (styleProperty && t.isObjectProperty(styleProperty)) {
      styleProperty.value = nextStyle
    }
    else { props.properties.push(t.objectProperty(t.identifier('style'), nextStyle)) }
    props.properties = props.properties.filter(property => property !== classProperty)
    return
  }
  if (t.isExpression(value)) {
    const styleProperty = props.properties.find(property => t.isObjectProperty(property) && propertyName(property) === 'style')
    const styleExpression = styleProperty && t.isObjectProperty(styleProperty) ? styleProperty.value : undefined
    const nextStyle = styleExpression ? t.arrayExpression([styleExpression, callRuntime(program, state, value)]) : callRuntime(program, state, value)
    if (styleProperty && t.isObjectProperty(styleProperty)) {
      styleProperty.value = nextStyle
    }
    else { props.properties.push(t.objectProperty(t.identifier('style'), nextStyle)) }
    props.properties = props.properties.filter(property => property !== classProperty)
  }
}

export default function weappReactNativeBabel(): PluginObject<PluginState> {
  return {
    name: 'weapp-tailwindcss-react-native',
    visitor: {
      JSXOpeningElement(path, state) {
        if (shouldSkipFile(state.filename)) { return }
        const program = path.findParent(parent => parent.isProgram())
        if (!program?.isProgram()) { return }
        const classAttribute = path.node.attributes.find(attribute => t.isJSXAttribute(attribute) && attribute.name.name === 'className')
        if (!classAttribute || !t.isJSXAttribute(classAttribute)) { return }

        if (t.isStringLiteral(classAttribute.value)) {
          const tokens = classTokens(classAttribute.value.value)
          const allowed = state.opts.classNameSet ? new Set(state.opts.classNameSet) : undefined
          if (!hasKnownStaticTokens(classAttribute.value.value, allowed)) { return }
          applyStyleAttribute(path, callRuntime(program, state, t.stringLiteral(tokens.join(' '))))
          path.node.attributes = path.node.attributes.filter(attribute => attribute !== classAttribute)
          return
        }

        if (t.isJSXExpressionContainer(classAttribute.value) && classAttribute.value.expression) {
          applyStyleAttribute(path, callRuntime(program, state, classAttribute.value.expression as t.Expression))
          path.node.attributes = path.node.attributes.filter(attribute => attribute !== classAttribute)
        }
      },
      CallExpression(path, state) {
        if (shouldSkipFile(state.filename)) { return }
        const callee = path.node.callee
        const isCreateElement = t.isMemberExpression(callee)
          && !callee.computed
          && t.isIdentifier(callee.object, { name: 'React' })
          && t.isIdentifier(callee.property, { name: 'createElement' })
        if (!isCreateElement || !t.isObjectExpression(path.node.arguments[1])) { return }
        const program = path.findParent(parent => parent.isProgram())
        if (program?.isProgram()) { applyCreateElementProps(path.node.arguments[1], program, state) }
      },
    },
  }
}
