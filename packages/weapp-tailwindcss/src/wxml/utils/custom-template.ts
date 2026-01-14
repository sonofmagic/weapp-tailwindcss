import type { ITemplateHandlerOptions } from '../../types'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'
import { createAttributeMatcher } from '../custom-attributes'
import { templateReplacer } from './template-fragments'

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
