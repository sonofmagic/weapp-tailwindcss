import type { ParserPlugin } from '@babel/parser'
import type { NodePath } from '@babel/traverse'
import type { StringLiteral, TemplateElement } from '@babel/types'
import { describe, expect, it } from 'vitest'
import { parse, traverse } from '@/babel'
import { isClassContextLiteralPath } from '@/js/class-context'

type LiteralPath = NodePath<StringLiteral | TemplateElement>
type LiteralKind = 'StringLiteral' | 'TemplateElement'

function getLiteralPath(
  source: string,
  kind: LiteralKind,
  plugins: ParserPlugin[] = [],
  occurrence = 0,
): LiteralPath {
  const ast = parse(source, {
    sourceType: 'module',
    plugins,
  })
  let result: LiteralPath | undefined
  let currentOccurrence = 0

  traverse(ast, {
    StringLiteral(path: NodePath<StringLiteral>) {
      if (kind !== 'StringLiteral' || result) {
        return
      }
      if (currentOccurrence !== occurrence) {
        currentOccurrence += 1
        return
      }
      result = path as LiteralPath
      path.stop()
    },
    TemplateElement(path: NodePath<TemplateElement>) {
      if (kind !== 'TemplateElement' || result) {
        return
      }
      if (currentOccurrence !== occurrence) {
        currentOccurrence += 1
        return
      }
      result = path
      path.stop()
    },
  })

  if (!result) {
    throw new Error(`Unable to locate ${kind} in provided source.`)
  }

  return result
}

describe('isClassContextLiteralPath', () => {
  it('treats class-like object keys as class context', () => {
    expect(isClassContextLiteralPath(getLiteralPath('const data = { className: \'w-[100px]\' }', 'StringLiteral'))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('const data = { \'class-name\': \'w-[100px]\' }', 'StringLiteral', [], 1))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('const data = { \'class_name\': \'w-[100px]\' }', 'StringLiteral', [], 1))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('const data = { \'class:name\': \'w-[100px]\' }', 'StringLiteral', [], 1))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('const data = { title: \'w-[100px]\' }', 'StringLiteral'))).toBe(false)
  })

  it('treats class-like JSX attributes as class context', () => {
    expect(isClassContextLiteralPath(getLiteralPath('<view className="w-[100px]" />', 'StringLiteral', ['jsx']))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('<view hover-class="w-[100px]" />', 'StringLiteral', ['jsx']))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('<view data-role="w-[100px]" />', 'StringLiteral', ['jsx']))).toBe(false)
  })

  it('treats configured helper calls as class context', () => {
    expect(isClassContextLiteralPath(getLiteralPath('twMerge(\'w-[100px]\')', 'StringLiteral'))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('helpers[\'tw-merge\'](\'w-[100px]\')', 'StringLiteral', [], 1))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('helpers.tw_merge(\'w-[100px]\')', 'StringLiteral'))).toBe(true)
    expect(isClassContextLiteralPath(getLiteralPath('format(\'w-[100px]\')', 'StringLiteral'))).toBe(false)
    expect(isClassContextLiteralPath(getLiteralPath('helpers.run(\'w-[100px]\')', 'StringLiteral'))).toBe(false)
  })

  it('supports template elements in class-like contexts', () => {
    const templatePath = getLiteralPath('const data = { virtualHostClass: `w-[100px]` }', 'TemplateElement')
    expect(isClassContextLiteralPath(templatePath)).toBe(true)
  })
})
