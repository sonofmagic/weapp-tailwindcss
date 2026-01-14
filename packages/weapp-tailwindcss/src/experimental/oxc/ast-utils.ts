export interface Oxcast {
  [key: string]: any
}

function tryRequire<T = any>(id: string): T | undefined {
  try {
    // eslint-disable-next-line ts/no-require-imports
    return require(id)
  }
  catch {
    return undefined
  }
}

export function parseWithOxc(code: string): Oxcast {
  // Order: native > wasm > fallback
  const oxcNode = tryRequire<any>('@oxc-parser/node')
  if (oxcNode?.parseSync) {
    return oxcNode.parseSync(code, {
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      allowImportExportEverywhere: true,
      babelCompat: true,
      // collectComments: true, // if supported by the binding
    })
  }
  const oxcWasm = tryRequire<any>('@oxc-parser/wasm') ?? tryRequire<any>('oxc-parser')
  if (oxcWasm?.parseSync) {
    return oxcWasm.parseSync(code, {
      sourceType: 'module',
      babelCompat: true,
    })
  }
  throw new Error('No OXC parser binding found. Install @oxc-parser/node or @oxc-parser/wasm to use this POC.')
}

export function getIdentifierName(node: any): string | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }
  if (node.type === 'Identifier') {
    return node.name
  }
  if (typeof node.name === 'string') {
    return node.name
  }
  return undefined
}

function getSpan(node: any): { start: number, end: number } | undefined {
  const span = node?.span
  if (!span) {
    return undefined
  }
  const start = typeof span.start === 'number' ? span.start : undefined
  const end = typeof span.end === 'number' ? span.end : undefined
  if (typeof start === 'number' && typeof end === 'number') {
    return { start, end }
  }
  return undefined
}

export function isStringLiteral(node: any): node is { type: string, value: string } {
  return node?.type === 'StringLiteral' && typeof node?.value === 'string'
}

export function isTemplateLiteral(node: any): boolean {
  return node?.type === 'TemplateLiteral'
}

export function getTemplateQuasis(node: any): any[] {
  if (Array.isArray(node?.quasis)) {
    return node.quasis
  }
  return []
}

export function getTplElementRaw(elem: any): string | undefined {
  if (typeof elem?.value?.raw === 'string') {
    return elem.value.raw
  }
  if (typeof elem?.raw === 'string') {
    return elem.raw
  }
  return undefined
}

export function isTaggedTemplate(node: any): boolean {
  return node?.type === 'TaggedTemplateExpression'
}

export function getTaggedTemplateTag(node: any): any {
  return node?.tag
}

export function isCallExpression(node: any): boolean {
  return node?.type === 'CallExpression'
}

export function getCallCallee(node: any): any {
  return node?.callee
}

export function getCallArguments(node: any): any[] {
  const args = node?.arguments
  if (Array.isArray(args)) {
    return args
  }
  return []
}

export function isImportDeclaration(node: any): boolean {
  return node?.type === 'ImportDeclaration'
}

export function isExportAllDeclaration(node: any): boolean {
  return node?.type === 'ExportAllDeclaration'
}

export function getImportSourceLiteral(node: any): any | undefined {
  const src = node?.source
  if (src && typeof src === 'object') {
    return src
  }
  return undefined
}

export function sliceStringLiteralText(
  code: string,
  node: any,
): { start: number, end: number, text: string } | undefined {
  const span = getSpan(node)
  if (!span) {
    return undefined
  }
  const start = span.start + 1
  const end = span.end - 1
  if (start >= end) {
    return undefined
  }
  const text = code.slice(start, end)
  return { start, end, text }
}

export function sliceTplElementText(
  code: string,
  elem: any,
): { start: number, end: number, text: string } | undefined {
  const span = getSpan(elem)
  if (!span) {
    return undefined
  }
  const { start, end } = span
  if (start >= end) {
    return undefined
  }
  const text = code.slice(start, end)
  return { start, end, text }
}
