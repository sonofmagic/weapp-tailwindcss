/* eslint-disable no-console */

import type { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import process from 'node:process'
import { transformSync } from '@babel/core'
import babelPlugin from './babel'
import { getManifestPathsForProjectRoot, getRegisteredManifest, getRegisteredManifestByPath, getRegisteredManifestByProjectRoot, getVirtualModuleCodeAsync } from './metro'

const require = createRequire(import.meta.url)

export async function transform(config: Record<string, unknown>, projectRoot: string, filename: string, data: Buffer, options: Record<string, unknown>) {
  const virtualCode = await getVirtualModuleCodeAsync(filename)
  const metroId = config.weappTailwindcssMetroId as string | undefined
  const manifestPath = config.weappTailwindcssManifestPath as string | undefined
  const manifestReadyPath = config.weappTailwindcssManifestReadyPath as string | undefined
  const virtualModulePath = config.weappTailwindcssVirtualModulePath as string | undefined
  const projectManifestPaths = getManifestPathsForProjectRoot(projectRoot)
  const registeredManifest = (metroId ? await getRegisteredManifest(metroId) : undefined)
    ?? (manifestPath ? await getRegisteredManifestByPath(manifestPath) : undefined)
    ?? await getRegisteredManifestByProjectRoot(projectRoot)
  const manifest = registeredManifest ?? await readManifest(
    manifestPath ?? projectManifestPaths.manifestPath,
    manifestReadyPath ?? projectManifestPaths.manifestReadyPath,
  )
  if (process.env.WEAPP_TW_RN_DEBUG === '1' && !filename.replaceAll('\\', '/').includes('/node_modules/')) {
    console.error(`[react-native-debug] ${JSON.stringify({
      filename,
      projectRoot,
      configKeys: Object.keys(config).filter(key => key.startsWith('weappTailwindcss')),
      manifestPath,
      manifestReadyPath,
      virtualModulePath,
      virtualCode: Boolean(virtualCode),
      manifestClasses: manifest?.classSet.length ?? null,
      manifestReady: manifestReadyPath ? fs.existsSync(manifestReadyPath) : null,
      inputBytes: data.byteLength,
    })}`)
  }
  let source = virtualCode ? Buffer.from(virtualCode) : data
  if (!virtualCode && manifest && virtualModulePath === filename) {
    source = Buffer.from(fs.readFileSync(filename))
  }
  if (!virtualCode && manifest && /\.(?:[cm]?[jt]sx?|flow)$/i.test(filename) && !filename.replaceAll('\\', '/').includes('/node_modules/')) {
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

async function readManifest(filename: string, readyPath: string | undefined) {
  if (readyPath) {
    const deadline = Date.now() + 120_000
    while (Date.now() < deadline) {
      try {
        await fs.promises.access(readyPath)
        break
      }
      catch {
        await new Promise(resolve => setTimeout(resolve, 25))
      }
    }
  }
  try {
    return JSON.parse(await fs.promises.readFile(filename, 'utf8')) as Awaited<ReturnType<typeof getRegisteredManifest>>
  }
  catch {
    return undefined
  }
}
