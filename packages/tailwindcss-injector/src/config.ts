import type { Options } from './types'
import process from 'node:process'
import { defuOverrideArray } from './utils'

function getDefaultConfig(): Options {
  return {
    filter: () => true,
    config: undefined,
    // 倒叙插入
    directiveParams: ['utilities', 'components'],
    cwd: process.cwd(),
    extensions: ['wxml', 'js', 'ts'],
    // @import and @use (scss)
    insertAfterAtRulesNames: ['import', 'use'],
  }
}

export function getConfig(options?: Partial<Options>) {
  return defuOverrideArray<Options, Options[]>(options as Options, getDefaultConfig())
}
