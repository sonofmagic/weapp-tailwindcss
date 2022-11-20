import { replaceWxml as replaceJs } from './wxml/shared'
import { cssSelectorReplacer as replaceCss, internalCssSelectorReplacer as replaceEscapedCss } from './postcss/shared'
import { MappingChars2String, MappingChars2StringEntries } from './dic'

export { replaceJs, replaceCss, replaceEscapedCss, MappingChars2String, MappingChars2StringEntries }
