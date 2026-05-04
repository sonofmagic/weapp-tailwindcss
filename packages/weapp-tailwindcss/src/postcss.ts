import type { IStyleHandlerOptions } from '@weapp-tailwindcss/postcss/types'
import type { PluginCreator, Result, Root } from 'postcss'
import type {
  TailwindV4CandidateSource,
  TailwindV4SourceOptions,
  WeappTailwindcssGenerateOptions,
  WeappTailwindcssGenerateResult,
  WeappTailwindcssGeneratorTarget,
} from './generator'
import path from 'node:path'
import process from 'node:process'
import postcss from 'postcss'
import {
  createWeappTailwindcssGenerator,
  resolveTailwindV4Source,
} from './generator'

const PLUGIN_NAME = 'weapp-tailwindcss'

export interface WeappTailwindcssPostcssPluginOptions extends TailwindV4SourceOptions {
  target?: WeappTailwindcssGeneratorTarget
  candidates?: Iterable<string>
  sources?: TailwindV4CandidateSource[]
  styleOptions?: Partial<IStyleHandlerOptions>
}

function resolveInputFile(result: Result) {
  const from = result.opts.from
  return typeof from === 'string' && from.length > 0 ? from : undefined
}

function resolvePostcssBase(result: Result, options: WeappTailwindcssPostcssPluginOptions) {
  if (options.base) {
    return options.base
  }
  const inputFile = resolveInputFile(result)
  return inputFile ? path.dirname(inputFile) : process.cwd()
}

function resolvePostcssProjectRoot(result: Result, options: WeappTailwindcssPostcssPluginOptions) {
  if (options.projectRoot) {
    return options.projectRoot
  }
  const inputFile = resolveInputFile(result)
  return inputFile ? path.dirname(inputFile) : process.cwd()
}

function replaceRootCss(root: Root, css: string, result: Result) {
  const nextRoot = postcss.parse(css, {
    from: resolveInputFile(result),
  })
  root.removeAll()
  root.append(nextRoot.nodes)
}

function addDependencyMessages(result: Result, generated: WeappTailwindcssGenerateResult) {
  for (const file of generated.dependencies) {
    result.messages.push({
      type: 'dependency',
      plugin: PLUGIN_NAME,
      file,
    })
  }
}

export const weappTailwindcssPostcssPlugin: PluginCreator<WeappTailwindcssPostcssPluginOptions> = (options = {}) => {
  return {
    postcssPlugin: PLUGIN_NAME,
    async Once(root, { result }) {
      const {
        candidates,
        sources,
        styleOptions,
        target = 'weapp',
        ...sourceOptions
      } = options
      const source = await resolveTailwindV4Source({
        ...sourceOptions,
        css: sourceOptions.css ?? root.toString(),
        base: resolvePostcssBase(result, options),
        projectRoot: resolvePostcssProjectRoot(result, options),
      })
      const generator = createWeappTailwindcssGenerator(source)
      const generateOptions: WeappTailwindcssGenerateOptions = {
        candidates,
        sources,
        styleOptions,
        target,
      }
      const generated = await generator.generate(generateOptions)

      replaceRootCss(root, generated.css, result)
      addDependencyMessages(result, generated)
      result.messages.push({
        type: 'weapp-tailwindcss:generated',
        plugin: PLUGIN_NAME,
        target: generated.target,
        classSet: generated.classSet,
        rawCss: generated.rawCss,
      })
    },
  }
}

weappTailwindcssPostcssPlugin.postcss = true

export default weappTailwindcssPostcssPlugin
