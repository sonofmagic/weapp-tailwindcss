import chalk from 'chalk'
import type { IMangleOptions, IMangleContextClass } from '@/types'
const acceptPrefix = 'abcdefghijklmnopqrstuvwxyz_'.split('')
const acceptChars = 'abcdefghijklmnopqrstuvwxyz_-0123456789'.split('')

function stripEscapeSequence (words: string) {
  return words.replace(/\\/g, '')
}

class ClassGenerator {
  public newClassMap: Record<string, IMangleContextClass>
  public newClassSize: number
  public context: Record<string, any>
  constructor () {
    this.newClassMap = {}
    this.newClassSize = 0
    this.context = {}
  }

  defaultClassGenerator () {
    const chars = []
    let rest = (this.newClassSize - (this.newClassSize % acceptPrefix.length)) / acceptPrefix.length
    if (rest > 0) {
      while (true) {
        rest -= 1
        const m = rest % acceptChars.length
        const c = acceptChars[m]
        chars.push(c)
        rest -= m
        if (rest === 0) {
          break
        }
        rest /= acceptChars.length
      }
    }
    const prefixIndex = this.newClassSize % acceptPrefix.length

    const newClassName = `${acceptPrefix[prefixIndex]}${chars.join('')}`
    return newClassName
  }

  generateClassName (original: string, opts: IMangleOptions): IMangleContextClass {
    original = stripEscapeSequence(original)
    const cn = this.newClassMap[original]
    if (cn) return cn

    let newClassName
    if (opts.classGenerator) {
      newClassName = opts.classGenerator(original, opts, this.context)
    }
    if (!newClassName) {
      newClassName = this.defaultClassGenerator()
    }

    if (opts.reserveClassName && opts.reserveClassName.includes(newClassName)) {
      if (opts.log) {
        console.log(`The class name has been reserved. ${chalk.green(newClassName)}`)
      }
      this.newClassSize++
      return this.generateClassName(original, opts)
    }
    if (opts.log) {
      console.log(`Minify class name from ${chalk.green(original)} to ${chalk.green(newClassName)}`)
    }
    const newClass: IMangleContextClass = {
      name: newClassName,
      usedBy: []
    }
    this.newClassMap[original] = newClass
    this.newClassSize++
    return newClass
  }
}

export default ClassGenerator
