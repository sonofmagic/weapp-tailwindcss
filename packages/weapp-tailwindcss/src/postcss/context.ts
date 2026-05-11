import type { Result, Root } from 'postcss'
import type { WeappTailwindcssGenerateResult } from '../generator'
import type { WeappTailwindcssPostcssPluginOptions } from '../postcss'
import path from 'node:path'
import process from 'node:process'
import postcss from 'postcss'

const PLUGIN_NAME = 'weapp-tailwindcss'

export function resolveInputFile(result: Result) {
  const from = result.opts.from
  if (typeof from !== 'string' || from.length === 0) {
    return undefined
  }
  return path.isAbsolute(from) ? from : path.resolve(process.cwd(), from)
}

export function resolvePostcssBase(result: Result, options: WeappTailwindcssPostcssPluginOptions) {
  if (options.base) {
    return options.base
  }
  const inputFile = resolveInputFile(result)
  return inputFile ? path.dirname(inputFile) : process.cwd()
}

export function resolvePostcssProjectRoot(result: Result, options: WeappTailwindcssPostcssPluginOptions) {
  if (options.projectRoot) {
    return options.projectRoot
  }
  const inputFile = resolveInputFile(result)
  return inputFile ? path.dirname(inputFile) : process.cwd()
}

export function replaceRootCss(root: Root, css: string, result: Result) {
  root.removeAll()
  try {
    const nextRoot = postcss.parse(css, {
      from: resolveInputFile(result),
    })
    root.append(nextRoot.nodes)
  }
  catch {
    root.raws = {
      after: css,
    }
  }
}

export function addDependencyMessages(result: Result, generated: WeappTailwindcssGenerateResult) {
  for (const file of generated.dependencies) {
    result.messages.push({
      type: 'dependency',
      plugin: PLUGIN_NAME,
      file,
    })
  }
}

export function addSourceDependencyMessages(result: Result, files: string[]) {
  for (const file of files) {
    result.messages.push({
      type: 'dependency',
      plugin: PLUGIN_NAME,
      file,
    })
  }
}
