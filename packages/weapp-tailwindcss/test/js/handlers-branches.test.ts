import type { NodePath } from '@babel/traverse'
import type { NumericLiteral, StringLiteral, TemplateElement } from '@babel/types'
import { MappingChars2String } from '@weapp-core/escape'
import { describe, expect, it } from 'vitest'
import { parse, traverse } from '@/babel'
import { replaceHandleValue } from '@/js/handlers'

type LiteralKind = 'StringLiteral' | 'TemplateElement'

function getLiteralPath(code: string, kind: LiteralKind) {
  const ast = parse(code, {
    sourceType: 'module',
  })
  let result: NodePath<StringLiteral | TemplateElement> | undefined

  traverse(ast, {
    StringLiteral(path: NodePath<StringLiteral>) {
      if (kind !== 'StringLiteral' || result) {
        return
      }
      result = path as NodePath<StringLiteral | TemplateElement>
      path.stop()
    },
    TemplateElement(path: NodePath<TemplateElement>) {
      if (kind !== 'TemplateElement' || result) {
        return
      }
      result = path
      path.stop()
    },
  })

  if (!result) {
    throw new Error(`Unable to locate ${kind} in provided code snippet.`)
  }

  return result
}

function getNumericLiteralPath(code: string) {
  const ast = parse(code, {
    sourceType: 'module',
  })
  let result: NodePath<NumericLiteral> | undefined

  traverse(ast, {
    NumericLiteral(path: NodePath<NumericLiteral>) {
      if (!result) {
        result = path
        path.stop()
      }
    },
  })

  if (!result) {
    throw new Error('Unable to locate NumericLiteral in provided code snippet.')
  }

  return result as unknown as NodePath<StringLiteral | TemplateElement>
}

describe('replaceHandleValue branch coverage', () => {
  it('returns undefined when no usable tokens are extracted', () => {
    const literal = getLiteralPath('const blank = \'   \'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      needEscaped: true,
    })

    expect(token).toBeUndefined()
  })

  it('forces escaping when alwaysEscape is enabled', () => {
    const literal = getLiteralPath('const cls = \'w-[100px]\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      alwaysEscape: true,
      needEscaped: true,
    })

    expect(token?.value).toBe('w-_b100px_B')
    expect(token?.start).toBe(literal.node.start! + 1)
    expect(token?.end).toBe(literal.node.end! - 1)
  })

  it('honours inline ignore comments', () => {
    const literal = getLiteralPath('const ignored = /* weapp-tw ignore */ \'w-[100px]\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['w-[100px]']),
      needEscaped: true,
    })

    expect(token).toBeUndefined()
  })

  it('respects jsPreserveClass and skips protected candidates', () => {
    const literal = getLiteralPath('const safe = \'w-[100px]\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['w-[100px]']),
      jsPreserveClass: () => true,
      needEscaped: true,
    })

    expect(token).toBeUndefined()
  })

  it('decodes unicode escape sequences before processing', () => {
    const literal = getLiteralPath('const unicodeCls = \'\\\\u0077-[100px]\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['w-[100px]']),
      needEscaped: true,
      unescapeUnicode: true,
    })

    expect(token?.value).toBe('w-_b100px_B')
  })

  it('transforms template elements without shifting offsets', () => {
    const quasi = getLiteralPath('const tpl = `w-[100px]`', 'TemplateElement')
    const token = replaceHandleValue(quasi, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['w-[100px]']),
      needEscaped: false,
    })

    expect(token?.value).toBe('w-_b100px_B')
    expect(token?.start).toBe(quasi.node.start)
  })

  it('skips transformation when the class is unchanged after escaping', () => {
    const literal = getLiteralPath('const plain = \'flex\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['flex']),
      needEscaped: true,
    })

    expect(token).toBeUndefined()
  })

  it('replaces all repeated occurrences in a single pass', () => {
    const literal = getLiteralPath('const repeated = \'w-[100px] w-[100px]\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['w-[100px]']),
      needEscaped: true,
    })

    expect(token?.value).toBe('w-_b100px_B w-_b100px_B')
  })

  it('evaluates unicode decoding guard when no escape is present', () => {
    const literal = getLiteralPath('const plain = \'flex\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['flex']),
      needEscaped: true,
      unescapeUnicode: true,
    })

    expect(token).toBeUndefined()
  })

  it('skips candidates that are not part of the classNameSet', () => {
    const literal = getLiteralPath('const missing = \'w-[100px]\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['bg-red-500']),
      needEscaped: true,
    })

    expect(token).toBeUndefined()
  })

  it('ignores classes when neither alwaysEscape nor classNameSet applies', () => {
    const literal = getLiteralPath('const untouched = \'w-[100px]\'', 'StringLiteral')
    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      needEscaped: true,
    })

    expect(token).toBeUndefined()
  })

  it('avoids emitting tokens when the source span collapses', () => {
    const literal = getLiteralPath('const collapsing = \'w-[100px]\'', 'StringLiteral')
    literal.node.start = 0
    literal.node.end = 0

    const token = replaceHandleValue(literal, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['w-[100px]']),
      needEscaped: true,
    })

    expect(token).toBeUndefined()
  })

  it('treats unexpected node types as empty literals', () => {
    const numeric = getNumericLiteralPath('const value = 42')
    const token = replaceHandleValue(numeric, {
      escapeMap: MappingChars2String,
      classNameSet: new Set(['42']),
      needEscaped: true,
    })

    expect(token).toBeUndefined()
  })

  // 留空以保持 branch 结构稳定，后续如需新增场景可在此处补充
})
