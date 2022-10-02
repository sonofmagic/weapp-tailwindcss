import { parseExpression, traverse, generate } from '@/babel'
import { replaceWxml } from './shared'
import { variableMatch, variableRegExp, vueTemplateClassRegexp, tagWithEitherClassAndHoverClassRegexp } from '@/reg'
import type { RawSource, ICommonReplaceOptions, Node } from '@/types'

export function generateCode (match: string, options: ICommonReplaceOptions = {}) {
  const ast = parseExpression(match) as Node

  traverse(ast, {
    StringLiteral (path) {
      // parentPath maybe null
      if (path.parent.type === 'BinaryExpression') {
        if (path.parentPath?.parent.type === 'ConditionalExpression') {
          return
        }
        // || path.parentPath?.parent.type === 'ExpressionStatement'
      }
      // ConditionalExpression
      path.node.value = replaceWxml(path.node.value, options)
    },
    noScope: true
  })

  const { code } = generate(ast, {
    compact: true,
    minified: true,
    jsescOption: {
      quotes: 'single'
    }
  })
  // if (options.classGenerator) {
  //   return ` ${code} `
  // }
  return code
}

export function extractSource (original: string) {
  let match = variableMatch(original)
  const sources: RawSource[] = []

  while (match !== null) {
    // 过滤空字符串
    // if (match[1].trim().length) {
    const start = match.index
    const end = variableRegExp.lastIndex
    sources.push({
      start,
      end,
      raw: match[1],
      prevConcatenated: !/\s/.test(original[start - 1]),
      nextConcatenated: !/\s/.test(original[end])
    })

    match = variableMatch(original)
  }
  return sources
}

export function templeteReplacer (original: string, options: ICommonReplaceOptions = {}) {
  const sources = extractSource(original)

  if (sources.length) {
    const resultArray: string[] = []
    let p = 0
    for (let i = 0; i < sources.length; i++) {
      const m = sources[i]
      const before = original.slice(p, m.start)
      // const isPrevVarConcated = !/\s/.test(before[before.length - 1])
      // const isNextVarConcated = !/\s/.test(before[0])
      // 匹配前值
      resultArray.push(
        replaceWxml(before, {
          keepEOL: true,
          classGenerator: options.classGenerator
        })
      )
      p = m.start
      // 匹配后值
      if (m.raw.trim().length) {
        const code = generateCode(m.raw, options)
        let source = `{{${code}}}`
        if (options.classGenerator) {
          source = `${m.prevConcatenated ? '' : ' '}${source}${m.nextConcatenated ? '' : ' '}`
        }
        m.source = source
      } else {
        m.source = ''
      }

      resultArray.push(m.source)
      p = m.end
      // 匹配最终尾部值
      if (i === sources.length - 1) {
        const after = original.slice(m.end)
        resultArray.push(
          replaceWxml(after, {
            keepEOL: true,
            classGenerator: options.classGenerator
          })
        )
      }
    }

    return resultArray
      .filter((x) => x)
      .join('')
      .trim()
  } else {
    return replaceWxml(original, {
      keepEOL: false,
      classGenerator: options.classGenerator
    })
  }
}

export function templeteHandler (rawSource: string, options: ICommonReplaceOptions = {}) {
  return rawSource.replace(tagWithEitherClassAndHoverClassRegexp, (m0) => {
    return m0.replace(vueTemplateClassRegexp, (m1, className) => {
      return m1.replace(className, templeteReplacer(className, options))
    })
  })
}
