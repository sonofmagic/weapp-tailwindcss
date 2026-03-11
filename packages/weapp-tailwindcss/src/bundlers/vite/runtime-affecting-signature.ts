import type { NodePath } from '@babel/traverse'
import type { JSXText, StringLiteral, TemplateElement } from '@babel/types'
import type { EntryType } from './bundle-state'
import { Parser } from 'htmlparser2'
import { traverse } from '@/babel'
import { babelParse } from '@/js/babel'

function createHtmlRuntimeAffectingSignature(source: string) {
  try {
    const parts: string[] = []

    const parser = new Parser(
      {
        onattribute(name, value) {
          parts.push(`a:${name}=${value}`)
        },
        oncomment(data) {
          parts.push(`c:${data}`)
        },
        ontext(data) {
          const value = data.trim()
          if (value.length > 0) {
            parts.push(`t:${value}`)
          }
        },
      },
      {
        xmlMode: true,
      },
    )

    parser.write(source)
    parser.end()

    return parts.join('\n')
  }
  catch {
    return source
  }
}

function createJsRuntimeAffectingSignature(source: string) {
  try {
    const ast = babelParse(source, {
      cache: true,
      cacheKey: 'vite-runtime-affecting:unambiguous',
      plugins: ['jsx', 'typescript'],
      sourceType: 'unambiguous',
    })
    const parts: string[] = []

    traverse(ast, {
      noScope: true,
      StringLiteral(path: NodePath<StringLiteral>) {
        parts.push(`s:${path.node.value}`)
      },
      TemplateElement(path: NodePath<TemplateElement>) {
        parts.push(`t:${path.node.value.raw}`)
      },
      JSXText(path: NodePath<JSXText>) {
        const value = path.node.value.trim()
        if (value.length > 0) {
          parts.push(`x:${value}`)
        }
      },
    } as any)

    const comments = (ast as any).comments
    if (Array.isArray(comments)) {
      for (const comment of comments) {
        if (typeof comment?.value === 'string' && comment.value.length > 0) {
          parts.push(`c:${comment.value}`)
        }
      }
    }

    return parts.join('\n')
  }
  catch {
    // 解析失败时退回原始源码，宁可多刷新也不要漏刷新。
    return source
  }
}

export function createRuntimeAffectingSourceSignature(source: string, type: EntryType) {
  if (type === 'html') {
    return createHtmlRuntimeAffectingSignature(source)
  }

  if (type === 'js') {
    return createJsRuntimeAffectingSignature(source)
  }

  return source
}
