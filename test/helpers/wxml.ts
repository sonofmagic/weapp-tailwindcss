import { html } from 'js-beautify'

export function format(source: string) {
  return html(source)
}
