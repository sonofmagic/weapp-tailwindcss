import * as t from '@babel/types'
import { replaceWxml } from './shared'
import { parseExpression, traverse, generate } from '@/babel'
import { variableRegExp, wxsTagRegexp, templateClassExactRegexp, tagWithEitherClassAndHoverClassRegexp, makeCustomAttributes } from '@/reg'
import { defu } from '@/utils'
import type { RawSource, ITempleteHandlerOptions } from '@/types'

export function generateCode(match: string, options: ITempleteHandlerOptions = {}) {
  const ast = parseExpression(match)

  traverse(ast, {
    StringLiteral(path) {
      // [g['人生']==='你好啊'?'highlight':'']
      if (t.isMemberExpression(path.parent)) {
        return
      }
      // parentPath maybe null
      // ['td',[(g.type==='你好啊')?'highlight':'']]
      if (t.isBinaryExpression(path.parent) && t.isConditionalExpression(path.parentPath?.parent)) {
        return
      }

      path.node.value = replaceWxml(path.node.value, options)
    },
    noScope: true
  })
  // @ts-ignore
  const { code } = generate(ast, {
    compact: true,
    minified: true,
    jsescOption: {
      quotes: 'single',
      minimal: true
    }
  })

  return code
}

/**
 * @internal
 */
function extract(original: string, reg: RegExp) {
  let match = reg.exec(original)
  const sources: RawSource[] = []

  while (match !== null) {
    // 过滤空字符串
    // if (match[1].trim().length) {
    const start = match.index
    const end = reg.lastIndex
    sources.push({
      start,
      end,
      raw: match[1]
    })

    match = reg.exec(original)
  }
  return sources
}

export function extractSource(original: string) {
  return extract(original, variableRegExp)
}

export function templeteReplacer(original: string, options: ITempleteHandlerOptions = {}) {
  const sources = extractSource(original)

  if (sources.length > 0) {
    const resultArray: string[] = []
    let p = 0
    for (let i = 0; i < sources.length; i++) {
      const m = sources[i]
      const before = original.slice(p, m.start)

      // 匹配前值
      resultArray.push(
        replaceWxml(before, {
          keepEOL: true,
          escapeMap: options.escapeMap,
          mangleContext: options.mangleContext
        })
      )
      p = m.start
      // 匹配后值
      if (m.raw.trim().length > 0) {
        const code = generateCode(m.raw, options)
        const source = `{{${code}}}`
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
            escapeMap: options.escapeMap,
            mangleContext: options.mangleContext
          })
        )
      }
    }

    return resultArray.filter(Boolean).join('').trim()
  } else {
    return replaceWxml(original, {
      keepEOL: false,
      escapeMap: options.escapeMap,
      mangleContext: options.mangleContext
    })
  }
}

export function templeteHandler(rawSource: string, options: ITempleteHandlerOptions = {}) {
  return rawSource.replace(tagWithEitherClassAndHoverClassRegexp, (m0) => {
    return m0.replace(templateClassExactRegexp, (m1, className) => {
      return m1.replace(className, templeteReplacer(className, options))
    })
  })
}

export function customTempleteHandler(rawSource: string, options: Required<ITempleteHandlerOptions>) {
  const { customAttributesEntities, inlineWxs, runtimeSet, jsHandler } = options
  let source = templeteHandler(rawSource, options)
  const regexps = makeCustomAttributes(customAttributesEntities)
  if (regexps && Array.isArray(regexps)) {
    for (const regexp of regexps) {
      source = source.replace(regexp.tagRegexp, (m0) => {
        return m0.replace(regexp.attrRegexp, (m1, className) => {
          return m1.replace(className, templeteReplacer(className, options))
        })
      })
    }
  }
  if (inlineWxs) {
    const wxsTags = extract(source, wxsTagRegexp)
    for (const x of wxsTags) {
      const code = jsHandler(x.raw, runtimeSet).code
      source = source.replaceAll(x.raw, code)
    }
  }
  return source
}

export function createTempleteHandler(options: Omit<ITempleteHandlerOptions, 'runtimeSet'> = {}) {
  return (rawSource: string, opt: Pick<ITempleteHandlerOptions, 'runtimeSet'> = {}) => {
    return customTempleteHandler(rawSource, defu(opt, options) as Required<ITempleteHandlerOptions>)
  }
}
