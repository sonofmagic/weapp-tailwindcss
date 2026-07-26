import type { Buffer } from 'node:buffer'
import { createRequire } from 'node:module'
import { getVirtualModuleCodeAsync } from './metro'

const require = createRequire(import.meta.url)

export async function transform(config: Record<string, unknown>, projectRoot: string, filename: string, data: Buffer, options: Record<string, unknown>) {
  const virtualCode = await getVirtualModuleCodeAsync(filename)
  if (virtualCode) {
    return {
      output: [{ type: 'js/module', data: { code: virtualCode, map: null } }],
      dependencies: [],
    }
  }
  const originalPath = config.weappTailwindcssOriginalTransformerPath as string | undefined
  const transformer = originalPath
    ? require(originalPath)
    : require('metro-react-native-babel-transformer')
  return transformer.transform(config, projectRoot, filename, data, options)
}
