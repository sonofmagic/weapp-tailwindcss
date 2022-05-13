import path from 'path'
import replace from 'regexp-replace'
export { styleHandler } from './postcss'
export { templeteHandler } from './wxml'
export { jsxHandler } from './jsx'
export { getOptions } from './defaults'
export { createInjectPreflight } from './postcss/preflight'
export const pluginName = 'weapp-tailwindcss-webpack-plugin'

export const postcssPlugin = 'postcss-weapp-tailwindcss-rename'

export function getFileName (file: string) {
  return path.basename(file, path.extname(file))
}

export const classRegexp = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gim

export const tagRegexp = /[\r\n\s]*<(?:\/)?([^ =>]+)([^>]*?)(?:\/)?>/gim

// export const noClosedTagRegexp = /[\r\n\s]*<([^ =>]+)([^>]*?)(?:\/)?>/gim

export function classStringReplace (str: string, replacement: (string: string) => string) {
  return replace(str, classRegexp, replacement)
}

export function tagStringRegexp (str: string, replacement: (string: string, arr?: RegExpExecArray, index?: number, lastIndex?: number) => string) {
  return replace(str, tagRegexp, replacement)
}
