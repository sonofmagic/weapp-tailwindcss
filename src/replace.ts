import { replaceWxml as replaceJs } from './wxml/shared'
import { cssSelectorReplacer as replaceCss, internalCssSelectorReplacer as replaceEscapedCss } from './postcss/shared'
export * from './dic'

export { replaceJs, replaceCss, replaceEscapedCss }
