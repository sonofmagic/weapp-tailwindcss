import path from 'path'

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
