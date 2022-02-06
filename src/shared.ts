import path from 'path'

export { styleHandler } from './postcss'
export { templeteHandler } from './wxml'
export { jsxHandler } from './jsx'
export const pluginName = 'weapp-tailwindcss-webpack-plugin'

export function getFileName (file: string) {
  return path.basename(file, path.extname(file))
}
