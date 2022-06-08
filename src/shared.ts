import path from 'path'

export const pluginName = 'weapp-tailwindcss-webpack-plugin'

export function getFileName (file: string) {
  return path.basename(file, path.extname(file))
}
