export enum State {
  START,
  TEXT,
  OPEN_BRACE,
  POTENTIAL_CLOSE,
  BRACES_COMPLETE,
}

export interface Expression {
  start: number
  end: number
  value: string
}

export interface Token {
  start: number
  end: number
  value: string
  expressions: Expression[]
}
