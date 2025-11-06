import type { ITemplateHandlerOptions } from '../types'
import type { Token } from './Tokenizer'
import * as t from '@babel/types'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'
import { parseExpression, traverse } from '../babel'
import { replaceHandleValue } from '../js/handlers'
import { defuOverrideArray } from '../utils'
import { createAttributeMatcher, isPropsMatch } from './custom-attributes'
import { replaceWxml } from './shared'
import { Tokenizer } from './Tokenizer'
import { isAllWhitespace } from './whitespace'

export function generateCode(match: string, options: ITemplateHandlerOptions = {}) {
  try {
    const { jsHandler, runtimeSet } = options
    if (jsHandler && runtimeSet) {
      const runHandler = (wrap?: boolean) => jsHandler(match, runtimeSet, wrap ? { wrapExpression: true } : undefined)
      const initial = runHandler(options.wrapExpression)
      if (!initial.error || options.wrapExpression) {
        return initial.code
      }
      const fallback = runHandler(true)
      return fallback.code
    }
    else {
      /**
       * @deprecated
       */
      const ms = new MagicString(match)
      const ast = parseExpression(match)
      const jsTokenUpdater = new JsTokenUpdater()

      traverse(ast, {
        StringLiteral(path) {
          // [g['人生']==='你好啊'?'highlight':'']
          if (t.isMemberExpression(path.parent)) {
            return
          }
          // parentPath maybe null
          // ['td',[(g.type==='你好啊')?'highlight':'']]
          if (t.isBinaryExpression(path.parent) && (t.isConditionalExpression(path.parentPath?.parent) || t.isLogicalExpression(path.parentPath?.parent))) {
            return
          }
          jsTokenUpdater.addToken(
            replaceHandleValue(
              path,
              {
                escapeMap: options.escapeMap,
                classNameSet: options.runtimeSet,
                needEscaped: true,
                alwaysEscape: true,
              },
            ),
          )

          // path.node.value = replaceWxml(path.node.value, options)
        },
        noScope: true,
      })
      jsTokenUpdater.updateMagicString(ms)

      return ms.toString()
    }
  }
  catch {
    // 参考：https://github.com/sonofmagic/weapp-tailwindcss/issues/274
    // {{class}}
    return match
  }
}

export function handleEachClassFragment(ms: MagicString, tokens: Token[], options: ITemplateHandlerOptions = {}) {
  let previousEnd = 0
  for (const token of tokens) {
    if (token.start > previousEnd) {
      const gap = ms.slice(previousEnd, token.start)
      if (isAllWhitespace(gap)) {
        ms.update(previousEnd, token.start, replaceWxml(gap, {
          keepEOL: false,
          escapeMap: options.escapeMap,
          ignoreHead: true,
        }))
      }
    }
    let p = token.start
    if (token.expressions.length > 0) {
      for (const exp of token.expressions) {
        if (exp.start > token.start && p < exp.start) {
          ms.update(p, exp.start, replaceWxml(ms.slice(p, exp.start), {
            keepEOL: true,
            escapeMap: options.escapeMap,
            // 首的str才会被转译
            // example: 2xl:xx 2x{{y}}
            ignoreHead: p > 0,
          }))
        }
        const code = `{{${generateCode(exp.value.slice(2, -2), options)}}}`
        ms.update(exp.start, exp.end, code)
        p = exp.end
      }
      if (token.end > p) {
        ms.update(p, token.end, replaceWxml(ms.slice(p, token.end), {
          keepEOL: false,
          escapeMap: options.escapeMap,
          ignoreHead: true,
        }))
      }
    }
    else {
      ms.update(token.start, token.end, replaceWxml(token.value, {
        keepEOL: false,
        escapeMap: options.escapeMap,
        ignoreHead: false,
      }))
    }
    previousEnd = token.end
  }

  if (tokens.length > 0) {
    const lastToken = tokens[tokens.length - 1]
    if (lastToken.end < ms.original.length) {
      const gap = ms.slice(lastToken.end, ms.original.length)
      if (isAllWhitespace(gap)) {
        ms.update(lastToken.end, ms.original.length, replaceWxml(gap, {
          keepEOL: false,
          escapeMap: options.escapeMap,
          ignoreHead: true,
        }))
      }
    }
  }
}

export function templateReplacer(original: string, options: ITemplateHandlerOptions = {}) {
  const ms = new MagicString(original)
  const tokenizer = new Tokenizer()
  const tokens = tokenizer.run(ms.original)
  handleEachClassFragment(ms, tokens, options)
  return ms.toString()
}

export async function customTemplateHandler(rawSource: string, options: Required<ITemplateHandlerOptions>) {
  const {
    customAttributesEntities = [],
    disabledDefaultTemplateHandler,
    inlineWxs,
    runtimeSet,
    jsHandler,
  } = options ?? {}
  const matchCustomAttribute = createAttributeMatcher(customAttributesEntities)

  const s = new MagicString(rawSource)
  let tag = ''
  const wxsArray: {
    startIndex: number
    endIndex: number
    data: string
  }[] = []
  const parser = new Parser(
    {
      onopentagname(name) {
        tag = name
      },

      onattribute(name, value, quote) {
        if (!value) {
          return
        }
        const lowerName = name.toLowerCase()
        const shouldHandleDefault = !disabledDefaultTemplateHandler
          && (lowerName === 'class' || lowerName === 'hover-class' || lowerName === 'virtualhostclass')
        const shouldHandleCustom = matchCustomAttribute?.(tag, name) ?? false
        if (!shouldHandleDefault && !shouldHandleCustom) {
          return
        }
        s.update(
          parser.startIndex + name.length + 2,
          // !important
          // htmlparser2 9.0.0: parser.endIndex
          // htmlparser2 9.1.0: parser.endIndex - 1
          // https://github.com/sonofmagic/weapp-tailwindcss/issues/269
          parser.endIndex - 1,
          templateReplacer(value, {
            ...options,
            quote,
          }),
        )
      },
      ontext(data) {
        if (inlineWxs && tag === 'wxs') {
          wxsArray.push({
            data,
            endIndex: parser.endIndex + 1,
            startIndex: parser.startIndex,
          })
        }
      },
      onclosetag() {
        tag = ''
      },
    },
    {
      xmlMode: true,
    },
  )
  parser.write(s.original)
  parser.end()
  for (const { data, endIndex, startIndex } of wxsArray) {
    const { code } = await jsHandler(data, runtimeSet)
    s.update(startIndex, endIndex, code)
  }

  return s.toString()
}

export { isPropsMatch }

export function createTemplateHandler(options: Omit<ITemplateHandlerOptions, 'runtimeSet'> = {}) {
  return (rawSource: string, opt: Pick<ITemplateHandlerOptions, 'runtimeSet'> = {}) => {
    return customTemplateHandler(rawSource, defuOverrideArray(opt, options) as Required<ITemplateHandlerOptions>)
  }
}
