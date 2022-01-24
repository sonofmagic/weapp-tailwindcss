import chalk from './chalk'
import ClassGenerator from './classGenerator'
import type { Compilation, Compiler } from 'webpack'
import type { UserDefinedOptions } from './types'
const validate = (opts: UserDefinedOptions, classGenerator: ClassGenerator) => {
  if (!opts.log) return
  for (const className in classGenerator.newClassMap) {
    const c = classGenerator.newClassMap[className]
    if (c.usedBy.length >= 1) {
      continue
    }
    if (c.usedBy[0].match(/.+\.css:*$/)) {
      console.log(
        `The class name '${chalk.yellow(
          className
        )}' is not used: defined at ${chalk.yellow(c.usedBy[0])}.`
      )
    } else {
      console.log(
        `The class name '${chalk.yellow(
          className
        )}' is not defined: used at ${chalk.yellow(c.usedBy[0])}.`
      )
    }
  }
}

const optimize = (
  compiler: Compiler,
  [file, originalSource],
  compilation: Compilation,
  opts: UserDefinedOptions,
  classGenerator: ClassGenerator
) => {
  let classnameRegex
  if (file.match(/.+\.css.*$/)) {
    classnameRegex = new RegExp(`\\\.(${opts.classNameRegExp})`, 'g')
  } else if (file.match(/.+\.js.*$/) || file.match(/.+\.html.*$/)) {
    classnameRegex = new RegExp(`["'.\\\s](${opts.classNameRegExp})`, 'g')
  }
  if (!classnameRegex) {
    return
  }
  if (opts.ignorePrefix && opts.ignorePrefixRegExp) {
    throw new Error('Use only either "ignorePrefix" or "ignorePrefixRegExp".')
  }
  let ignorePrefixRegExp
  if (opts.ignorePrefixRegExp) {
    ignorePrefixRegExp = new RegExp(`^${opts.ignorePrefixRegExp}`)
  }

  const rawSource = originalSource.source()
  let source

  const { ReplaceSource } = compiler.webpack.sources
  let match
  while ((match = classnameRegex.exec(rawSource))) {
    const originalName = match[1]
    let targetName = originalName

    let originalPrefix = ''
    if (opts.ignorePrefix) {
      let ignorePrefix = opts.ignorePrefix
      if (typeof ignorePrefix === 'string') {
        ignorePrefix = [ignorePrefix]
      }
      for (let i = 0; i < ignorePrefix.length; i++) {
        if (originalName.startsWith(ignorePrefix[i])) {
          originalPrefix = ignorePrefix[i]
          break
        }
      }
    }
    if (ignorePrefixRegExp) {
      const prefix = ignorePrefixRegExp.exec(originalName)
      if (prefix && prefix.length > 0) {
        originalPrefix = prefix[0]
      }
    }
    if (originalPrefix) {
      targetName = originalName.substr(originalPrefix.length)
      if (opts.log) {
        console.log(
          `Skip the prefix ${chalk.red(originalPrefix)} of ${chalk.green(
            originalName
          )}`
        )
      }
    }

    const newClass = classGenerator.generateClassName(targetName, opts)
    if (!source) source = new ReplaceSource(originalSource)
    const startPos = match.index + match[0].indexOf(match[1])
    newClass.usedBy.push(`${file}:${startPos}`)
    const newClassName = `${originalPrefix}${newClass.name}`
    source.replace(startPos, startPos + originalName.length - 1, newClassName)
  }
  if (!source) {
    return
  }
  compilation.updateAsset(file, source)
}

const optimizer =
  (compiler: Compiler, compilation: Compilation, opts: UserDefinedOptions) =>
    (assets) => {
      if (!opts.classNameRegExp) {
        throw new Error(
          "'classNameRegExp' option is required. e.g. '[c]-[a-z][a-zA-Z0-9_]*'"
        )
      }
      const classGenerator = new ClassGenerator()
      Object.entries(assets).forEach((asset) =>
        optimize(compiler, asset, compilation, opts, classGenerator)
      )
      validate(opts, classGenerator)
    }

export default optimizer
