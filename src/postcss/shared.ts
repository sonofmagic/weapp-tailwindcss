import { MappingChars2String as dic } from '@/dic'
import { escape } from '@/base/escape'

export const postcssPlugin = 'postcss-weapp-tailwindcss-rename-plugin'
// css 中，要多加一个 '\' 来转义
export function cssSelectorReplacer (selector: string) {
  return (
    selector
      .replace(/\\\[/g, dic['[']) // \[
      .replace(/\\\]/g, dic[']']) // \]
      .replace(/\\\(/g, dic['(']) // \(
      .replace(/\\\)/g, dic[')']) // \)
      .replace(/\\#/g, dic['#']) // \# : hex
      .replace(/\\!/g, dic['!']) // \! : !important
      .replace(/\\\//g, dic['/']) // \/ : w-1/2 -> width:50%
      .replace(/\\\./g, dic['.']) // \. : w-1.5
      .replace(/\\:/g, dic[':']) // colon for screen
      // https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/8
      .replace(/\\%/g, dic['%'])
      // .replace(/\\,/g, '_d_')
      .replace(/\\2c /g, dic[','])
      .replace(/\\\\/g, dic['\\'])
      .replace(/\\'/g, dic["'"])
      .replace(/\\"/g, dic['"'])
      .replace(/\\\*/g, dic['*'])
      .replace(/\\&/g, dic['&'])
      .replace(/\\@/g, dic['@'])
      .replace(/\\{/g, dic['{'])
      .replace(/\\}/g, dic['}'])
  )
}

export function internalCssSelectorReplacer (selectors: string) {
  return escape(selectors)
}
