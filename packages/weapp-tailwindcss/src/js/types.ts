export interface JsTokenMeta {
  ignore?: boolean
}

export interface JsToken {
  start: number
  end: number
  value: string
  type?: 'TemplateElement' | 'StringLiteral'
  meta?: JsTokenMeta
}
