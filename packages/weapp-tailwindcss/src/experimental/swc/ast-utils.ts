export interface SwcAst {
  [key: string]: any
}

export function parseWithSwc(code: string): SwcAst {
  // Lazy require to keep this file "optional" for consumers.
  // eslint-disable-next-line ts/no-require-imports
  const swc = require('@swc/core') as any
  // Parse as a module with broad feature flags; consumers may tailor later.
  return swc.parseSync(code, {
    syntax: 'typescript',
    tsx: true,
    jsx: true,
    dynamicImport: true,
    decorators: false,
    target: 'es2022',
    comments: true,
    script: false, // prefer module
    preserveAllComments: true,
  } as any)
}

export function getIdentifierName(node: any): string | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }
  if (node.type === 'Identifier') {
    return node.value ?? node.name
  }
  if (typeof node.name === 'string') {
    return node.name
  }
  if (typeof node.value === 'string') {
    return node.value
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
  // SWC: Tpl; Babel/OXC: TemplateLiteral
  return node?.type === 'Tpl' || node?.type === 'TemplateLiteral'
}

export function getTemplateQuasis(node: any): any[] {
  // SWC: node.quasis is TplElement[]
  if (Array.isArray(node?.quasis)) {
    return node.quasis
  }
  return []
}

export function getTplElementRaw(elem: any): string | undefined {
  // SWC: elem.cooked/raw? Try both value.raw and raw/cooked fields.
  if (typeof elem?.raw === 'string') {
    return elem.raw
  }
  if (typeof elem?.cooked === 'string') {
    return elem.cooked
  }
  if (typeof elem?.value?.raw === 'string') {
    return elem.value.raw
  }
  if (typeof elem?.value?.cooked === 'string') {
    return elem.value.cooked
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
    return args.map(a => a?.expression ?? a)
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

/**
 * Given a StringLiteral-like node, compute [start, end] of the raw text
 * inside quotes and return the original text.
 */
export function sliceStringLiteralText(
  code: string,
  node: any,
): { start: number, end: number, text: string } | undefined {
  const span = getSpan(node)
  if (!span) {
    return undefined
  }
  const start = span.start + 1 // skip opening quote
  const end = span.end - 1 // skip closing quote
  if (start >= end) {
    return undefined
  }
  const text = code.slice(start, end)
  return { start, end, text }
}

/**
 * For template elements, SWC spans usually wrap the quasi text already.
 * We don't need to adjust offsets like Babel StringLiteral.
 */
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
