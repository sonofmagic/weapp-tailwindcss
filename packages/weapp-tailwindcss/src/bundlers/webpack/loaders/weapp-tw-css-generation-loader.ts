import type webpack from 'webpack'
import type { WebpackCssImportRewriteLoaderOptions } from './runtime-registry'
import { Buffer } from 'node:buffer'
import { hasTailwindApplyDirective, hasTailwindRootDirectives } from '@/bundlers/shared/generator-css/directives'
import {
  generateCssForWebpackPipeline,
  registerWebpackCssGeneratorSource,
  resolveWebpackCssPipelineLoaderOptions,
} from './weapp-tw-css-import-rewrite-loader'

const WeappTwCssGenerationLoader: webpack.LoaderDefinitionFunction<WebpackCssImportRewriteLoaderOptions> = async function (
  this: webpack.LoaderContext<WebpackCssImportRewriteLoaderOptions>,
  source: string | Buffer,
) {
  const options = resolveWebpackCssPipelineLoaderOptions(this.getOptions())
  const input = Buffer.isBuffer(source) ? source.toString('utf-8') : source
  const shouldGenerate = hasTailwindRootDirectives(input, { importFallback: true })
    || hasTailwindApplyDirective(input)
  if (!shouldGenerate) {
    return source
  }
  await registerWebpackCssGeneratorSource(input, this.resourcePath, options)
  return await generateCssForWebpackPipeline(input, this, options) ?? source
}

export default WeappTwCssGenerationLoader
