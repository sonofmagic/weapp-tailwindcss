import type { Buffer } from 'node:buffer'
import { createRequire } from 'node:module'
import { transformSync } from '@babel/core'
import babelPlugin from './babel'
import { getRegisteredManifest, getVirtualModuleCodeAsync } from './metro'

const require = createRequire(import.meta.url)

export async function transform(config: Record<string, unknown>, projectRoot: string, filename: string, data: Buffer, options: Record<string, unknown>) {
  const virtualCode = await getVirtualModuleCodeAsync(filename)
  if (virtualCode) {
    return {
      output: [{ type: 'js/module', data: { code: virtualCode, map: null } }],
      dependencies: [],
    }
  }
  const metroId = config.weappTailwindcssMetroId as string | undefined
  const manifest = metroId ? await getRegisteredManifest(metroId) : undefined
  let source = data
  if (manifest && /\.(?:[cm]?[jt]sx?|flow)$/i.test(filename) && !filename.replaceAll('\\', '/').includes('/node_modules/')) {
    const transformed = transformSync(data.toString(), {
      filename,
      configFile: false,
      babelrc: false,
      sourceType: 'unambiguous',
      parserOpts: { plugins: ['jsx', 'typescript'] },
      plugins: [[babelPlugin, {
        classNameSet: manifest.classSet,
        staticStyleMap: manifest.staticLookup,
      }]],
    })
    if (transformed?.code) {
      source = Buffer.from(transformed.code)
    }
  }
  const originalPath = config.weappTailwindcssOriginalTransformerPath as string | undefined
  const transformer = originalPath
    ? require(originalPath)
    : require('metro-react-native-babel-transformer')
  return transformer.transform(config, projectRoot, filename, source, options)
}
