import type MagicString from 'magic-string'
import type { ITemplateHandlerOptions } from '../../types'
import type { Expression } from '../Tokenizer'
import { replaceWxml } from '../shared'
import { isAllWhitespace } from '../whitespace'
import { generateCode } from './codegen'

export function updateWhitespaceGap(
  ms: MagicString,
  start: number,
  end: number,
  options: ITemplateHandlerOptions,
) {
  const gap = ms.slice(start, end)
  if (isAllWhitespace(gap)) {
    ms.update(start, end, replaceWxml(gap, {
      keepEOL: false,
      escapeMap: options.escapeMap,
      ignoreHead: true,
    }))
  }
}

export function updateWxmlSegment(
  ms: MagicString,
  start: number,
  end: number,
  options: ITemplateHandlerOptions,
  keepEOL: boolean,
  ignoreHead: boolean,
) {
  ms.update(start, end, replaceWxml(ms.slice(start, end), {
    keepEOL,
    escapeMap: options.escapeMap,
    ignoreHead,
  }))
}

export function updateExpressionSegment(
  ms: MagicString,
  exp: Expression,
  options: ITemplateHandlerOptions,
) {
  const code = `{{${generateCode(exp.value.slice(2, -2), options)}}}`
  ms.update(exp.start, exp.end, code)
}
