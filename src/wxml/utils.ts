import * as t from '@babel/types'
import { replaceWxml } from './shared'
import { parseExpression, traverse, generate } from '@/babel'
import { variableRegExp, wxsTagRegexp, templateClassExactRegexp, tagWithEitherClassAndHoverClassRegexp, makeCustomAttributes } from '@/reg'
import { defu } from '@/utils'
import type { RawSource, ITemplateHandlerOptions } from '@/types'

export function generateCode(match: string, options: ITemplateHandlerOptions = {}) {
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

export function templateReplacer(original: string, options: ITemplateHandlerOptions = {}) {
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

export function templateHandler(rawSource: string, options: ITemplateHandlerOptions = {}) {
  if (options.disabledDefaultTemplateHandler) {
    return rawSource
  }
  return rawSource.replace(tagWithEitherClassAndHoverClassRegexp, (m0) => {
    return m0.replace(templateClassExactRegexp, (m1, className) => {
      return m1.replace(className, templateReplacer(className, options))
    })
  })
}

export function customTemplateHandler(rawSource: string, options: Required<ITemplateHandlerOptions>) {
  const { customAttributesEntities, inlineWxs, runtimeSet, jsHandler } = options
  let source = templateHandler(rawSource, options)
  const regexps = makeCustomAttributes(customAttributesEntities)
  if (regexps && Array.isArray(regexps)) {
    for (const regexp of regexps) {
      source = source.replace(regexp.tagRegexp, (m0) => {
        return m0.replace(regexp.attrRegexp, (m1, className) => {
          return m1.replace(className, templateReplacer(className, options))
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

export function createTemplateHandler(options: Omit<ITemplateHandlerOptions, 'runtimeSet'> = {}) {
  return (rawSource: string, opt: Pick<ITemplateHandlerOptions, 'runtimeSet'> = {}) => {
    return customTemplateHandler(rawSource, defu(opt, options) as Required<ITemplateHandlerOptions>)
  }
}
