import {
  UniAppWeappTailwindcssWebpackPluginV4,
  TaroWeappTailwindcssWebpackPluginV4,
  RemaxWeappTailwindcssWebpackPluginV4,
  KboneWeappTailwindcssWebpackPluginV4,
  RaxTailwindcssWebpackPluginV5,
  NativeWeappTailwindcssWebpackPluginV5,
  ViteWeappTailwindcssPlugin
} from './framework'

import postcssWeappTailwindcssRename from './postcss/plugin'

import { replaceWxml as replaceJs } from './wxml'
import { cssSelectorReplacer as replaceCss } from './postcss/shared'

export {
  UniAppWeappTailwindcssWebpackPluginV4,
  TaroWeappTailwindcssWebpackPluginV4,
  RemaxWeappTailwindcssWebpackPluginV4,
  KboneWeappTailwindcssWebpackPluginV4,
  RaxTailwindcssWebpackPluginV5,
  ViteWeappTailwindcssPlugin,
  postcssWeappTailwindcssRename,
  NativeWeappTailwindcssWebpackPluginV5,
  replaceJs,
  replaceCss
}
