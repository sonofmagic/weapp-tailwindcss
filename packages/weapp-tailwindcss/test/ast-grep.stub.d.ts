/* eslint-disable ts/method-signature-style */
declare module '@ast-grep/napi' {
  interface Position {
    index: number
  }

  export interface Range {
    start: Position
    end: Position
  }

  export interface SgNode {
    child(index: number): SgNode | undefined
    parent(): SgNode | undefined
    kind(): string
    kindToRefine?: string
    text(): string
    range(): Range
    findAll<T = SgNode>(selector: unknown): T[]
  }

  export const Lang: {
    JavaScript: unknown
  }

  export function kind(language: unknown, name: string): unknown

  export function parseAsync(language: unknown, source: string): Promise<{
    root(): SgNode
  }>
}
