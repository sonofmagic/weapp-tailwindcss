import type { ITemplateHandlerOptions } from '../../types'
import MagicString from 'magic-string'
import { Tokenizer } from '../Tokenizer'
import { handleEachClassFragment } from './fragment-updater'

export function templateReplacer(original: string, options: ITemplateHandlerOptions = {}) {
  const ms = new MagicString(original)
  const tokenizer = new Tokenizer()
  const tokens = tokenizer.run(ms.original)
  handleEachClassFragment(ms, tokens, options)
  return ms.toString()
}
