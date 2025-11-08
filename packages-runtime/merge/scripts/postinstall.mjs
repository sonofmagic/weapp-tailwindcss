import { existsSync as defaultExistsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const requireFn = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * @param {object} [options]
 * @param {(path: string) => boolean} [options.existsSync]
 * @param {(path: string) => Promise<unknown>} [options.loadEsm]
 * @param {(path: string) => unknown | Promise<unknown>} [options.loadCjs]
 * @param {{ log: typeof console.log, error: typeof console.error }} [options.logger]
 */
export async function run(options = {}) {
  const {
    existsSync = defaultExistsSync,
    loadEsm = async filePath => import(pathToFileURL(filePath).href),
    loadCjs = filePath => requireFn(filePath),
    logger = console,
  } = options

  const esmPath = path.resolve(__dirname, '../dist/postinstall.js')
  const cjsPath = path.resolve(__dirname, '../dist/postinstall.cjs')

  const hasEsm = existsSync(esmPath)
  const hasCjs = existsSync(cjsPath)

  const loadErrors = []

  if (hasEsm) {
    try {
      await loadEsm(esmPath)
      return
    }
    catch (error) {
      loadErrors.push(error)
    }
  }

  if (hasCjs) {
    try {
      await loadCjs(cjsPath)
      return
    }
    catch (error) {
      loadErrors.push(error)
    }
  }

  if (!hasEsm && !hasCjs) {
    logger.log('postinstall bundle not found')
    return
  }

  logger.error('Failed to load postinstall bundle.')
  for (const error of loadErrors) {
    logger.error(error)
  }
  process.exitCode = process.exitCode ?? 1
}

const entryUrl = (() => {
  const candidate = process.argv[1]
  if (!candidate) {
    return undefined
  }
  try {
    return pathToFileURL(candidate).href
  }
  catch {
    return undefined
  }
})()

if (entryUrl === import.meta.url) {
  run().catch((error) => {
    console.error('Failed to execute postinstall entry.', error)
    process.exitCode = process.exitCode ?? 1
  })
}
