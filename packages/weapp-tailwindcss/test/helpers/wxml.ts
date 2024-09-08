import dedent from 'dedent'
import { html } from 'js-beautify'
import { normalizeEol } from './normalizeEol'

export function format(source: string) {
  return dedent`${normalizeEol(html(source))}`
}
