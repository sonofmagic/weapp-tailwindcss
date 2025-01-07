export {
  MappingChars2String,
  MappingChars2StringEntries,
  MappingStringDictionary,
  SimpleMappingChars2String,
  SimpleMappingChars2StringEntries,
  SYMBOL_TABLE,
  SYMBOL_TABLE_TYPE,
  SYMBOL_TABLE_TYPE_VALUES,
} from './escape'

export const weappTwIgnore = String.raw
// cssSelectorReplacer as replaceCss,
// replaceEscapedCss

export { internalCssSelectorReplacer as replaceCss } from './postcss/shared'
export { replaceWxml as replaceJs } from './wxml/shared'
