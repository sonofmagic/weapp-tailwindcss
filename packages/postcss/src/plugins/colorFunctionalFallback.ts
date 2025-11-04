import type { Declaration, Plugin } from 'postcss'
import type { FunctionNode, Node } from 'postcss-value-parser'
import valueParser from 'postcss-value-parser'

const RGB_FUNCTION_NAME = 'rgb'

const isSlashDiv = (node: Node) => node.type === 'div' && node.value === '/'

function trimNodes(nodes: Node[]) {
  let start = 0
  let end = nodes.length

  while (start < end && nodes[start]?.type === 'space') {
    start += 1
  }

  while (end > start && nodes[end - 1]?.type === 'space') {
    end -= 1
  }

  return nodes.slice(start, end)
}

function splitColorComponents(nodes: Node[]): Node[][] {
  const parts: Node[][] = []
  let current: Node[] = []

  nodes.forEach((node) => {
    if (node.type === 'div' && node.value === ',') {
      if (current.length) {
        parts.push(current)
        current = []
      }
      return
    }

    if (node.type === 'space') {
      if (current.length) {
        parts.push(current)
        current = []
      }
      return
    }

    current.push(node)
  })

  if (current.length) {
    parts.push(current)
  }

  return parts
}

const buildFunctionNodes = (content: string) => valueParser(content).nodes

function convertRgbFunction(fnNode: FunctionNode): boolean {
  const slashIndex = fnNode.nodes.findIndex(isSlashDiv)
  if (slashIndex === -1) {
    return false
  }

  const colorNodes = trimNodes(fnNode.nodes.slice(0, slashIndex))
  const alphaNodes = trimNodes(fnNode.nodes.slice(slashIndex + 1))

  if (!colorNodes.length || !alphaNodes.length) {
    return false
  }

  const colorParts = splitColorComponents(colorNodes)
  if (colorParts.length !== 3) {
    return false
  }

  const normalizedColors = colorParts
    .map(part => valueParser.stringify(part).trim())
    .filter(Boolean)

  if (normalizedColors.length !== 3) {
    return false
  }

  const alphaText = valueParser.stringify(alphaNodes).trim()
  if (!alphaText) {
    return false
  }

  fnNode.value = 'rgba'
  const nextValue = `${normalizedColors.join(', ')}, ${alphaText}`
  fnNode.nodes = buildFunctionNodes(nextValue)
  return true
}

function transformDeclaration(decl: Declaration) {
  if (!decl.value || !decl.value.toLowerCase().includes(RGB_FUNCTION_NAME)) {
    return
  }

  const parsed = valueParser(decl.value)
  let mutated = false

  parsed.walk((node) => {
    if (node.type !== 'function') {
      return
    }
    if (node.value.toLowerCase() !== RGB_FUNCTION_NAME) {
      return
    }
    if (convertRgbFunction(node)) {
      mutated = true
    }
  })

  if (mutated) {
    decl.value = parsed.toString()
  }
}

export function createColorFunctionalFallback(): Plugin {
  return {
    postcssPlugin: 'weapp-tailwindcss-color-functional-fallback',
    Declaration: transformDeclaration,
  }
}

createColorFunctionalFallback.postcss = true
