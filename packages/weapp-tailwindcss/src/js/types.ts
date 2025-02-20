import type { StringLiteral, TemplateElement } from '@babel/types'

export interface JsTokenMeta {
  ignore?: boolean
}

interface JsTokenTemplateElement {
  type: 'TemplateElement'
  ast: TemplateElement
}

interface JsTokenStringLiteral {
  type: 'StringLiteral'
  ast: StringLiteral
}

export type JsToken = (JsTokenTemplateElement | JsTokenStringLiteral) & {
  start: number
  end: number
  value: string
  type?: (string & {})
  meta?: JsTokenMeta
}
