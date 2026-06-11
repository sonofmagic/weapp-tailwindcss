import type { IArbitraryValues } from '@/types/shared'
import { extractSourceCandidates } from 'tailwindcss-patch'
import { traverse } from '@/babel'
import { babelParse } from '@/js/babel'

const SCRIPT_SOURCE_CANDIDATE_EXTENSIONS = new Set([
  'js',
  'jsx',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'mts',
  'cts',
])
const CLASS_LIKE_NAME_RE = /class/i

interface ScriptCandidateExtractionOptions {
  bareArbitraryValues?: IArbitraryValues['bareArbitraryValues'] | undefined
  extractor?: ((source: string, extension: string) => Promise<Iterable<string>> | Iterable<string>) | undefined
}

function getPropertyName(node: any) {
  if (!node) {
    return
  }
  if (node.type === 'Identifier') {
    return node.name
  }
  if (node.type === 'StringLiteral') {
    return node.value
  }
}

function isClassLikeStringPath(path: any) {
  const parent = path.parentPath
  if (!parent) {
    return false
  }

  if (parent.isVariableDeclarator?.()) {
    return CLASS_LIKE_NAME_RE.test(getPropertyName(parent.node.id) ?? '')
  }

  if (parent.isObjectProperty?.() || parent.isObjectMethod?.()) {
    return CLASS_LIKE_NAME_RE.test(getPropertyName(parent.node.key) ?? '')
  }

  if (parent.isAssignmentExpression?.()) {
    const left = parent.node.left
    if (left?.type === 'Identifier') {
      return CLASS_LIKE_NAME_RE.test(left.name)
    }
    if (left?.type === 'MemberExpression') {
      return CLASS_LIKE_NAME_RE.test(getPropertyName(left.property) ?? '')
    }
  }

  if (parent.isJSXAttribute?.()) {
    return CLASS_LIKE_NAME_RE.test(getPropertyName(parent.node.name) ?? '')
  }

  return false
}

function isTemplateElementInClassLikePath(path: any) {
  const templateLiteralPath = path.parentPath
  if (!templateLiteralPath?.isTemplateLiteral?.()) {
    return false
  }
  const parent = templateLiteralPath.parentPath
  if (!parent) {
    return false
  }
  if (parent.isVariableDeclarator?.()) {
    return CLASS_LIKE_NAME_RE.test(getPropertyName(parent.node.id) ?? '')
  }
  if (parent.isObjectProperty?.() || parent.isObjectMethod?.()) {
    return CLASS_LIKE_NAME_RE.test(getPropertyName(parent.node.key) ?? '')
  }
  if (parent.isAssignmentExpression?.()) {
    const left = parent.node.left
    if (left?.type === 'Identifier') {
      return CLASS_LIKE_NAME_RE.test(left.name)
    }
    if (left?.type === 'MemberExpression') {
      return CLASS_LIKE_NAME_RE.test(getPropertyName(left.property) ?? '')
    }
  }
  return false
}

export async function extractScriptStringCandidates(
  source: string,
  extension: string,
  options: ScriptCandidateExtractionOptions,
) {
  if (!SCRIPT_SOURCE_CANDIDATE_EXTENSIONS.has(extension)) {
    return []
  }

  const values = new Set<string>()
  try {
    const ast = babelParse(source, {
      cache: true,
      cacheKey: `vite-source-candidates:${extension}`,
      plugins: ['jsx', 'typescript'],
      sourceType: 'unambiguous',
    })

    traverse(ast, {
      noScope: true,
      StringLiteral(path: any) {
        if (isClassLikeStringPath(path)) {
          values.add(path.node.value)
        }
      },
      TemplateElement(path: any) {
        if (isTemplateElementInClassLikePath(path)) {
          values.add(path.node.value.raw)
        }
      },
    } as any)
  }
  catch {
    return []
  }

  const candidates = new Set<string>()
  for (const value of values) {
    const extractedCandidates = options.extractor
      ? await options.extractor(value, 'html')
      : await extractSourceCandidates(value, 'html', {
          ...(options.bareArbitraryValues === undefined ? {} : { bareArbitraryValues: options.bareArbitraryValues }),
        })
    for (const candidate of extractedCandidates) {
      candidates.add(candidate)
    }
  }
  return candidates
}
