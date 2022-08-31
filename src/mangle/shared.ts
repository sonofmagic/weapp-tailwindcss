import chalk from 'chalk'
import type { IMangleOptions } from '@/types'
import type { IClassGenerator } from './interfaces'

export const mangleClassPrefix = 'MANGLE__'

export const mangleClassSuffix = '__MANGLE'

export const mangleClassRegex = /MANGLE__[a-zA-Z0-9_-]+__MANGLE/g

export function markForMangled (str: string) {
  if (typeof str === 'string' && str) {
    return `${mangleClassPrefix}${str.trim()}${mangleClassSuffix}`
  }
  return str
}

export const acceptPrefix = 'abcdefghijklmnopqrstuvwxyz_'.split('')

export const acceptChars = 'abcdefghijklmnopqrstuvwxyz_-0123456789'.split('')

export function stripEscapeSequence (words: string) {
  return words.replace(/\\/g, '')
}

export const validate = (opts: IMangleOptions, classGenerator: IClassGenerator) => {
  if (!opts.log) return
  for (const className in classGenerator.newClassMap) {
    const c = classGenerator.newClassMap[className]
    if (c.usedBy.length >= 1) {
      continue
    }
    if (c.usedBy[0].match(/.+\.css:*$/)) {
      console.log(`The class name '${chalk.yellow(className)}' is not used: defined at ${chalk.yellow(c.usedBy[0])}.`)
    } else {
      console.log(`The class name '${chalk.yellow(className)}' is not defined: used at ${chalk.yellow(c.usedBy[0])}.`)
    }
  }
}
