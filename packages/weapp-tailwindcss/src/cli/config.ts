import { createRequire } from 'node:module'

type NodeRequireFunction = ReturnType<typeof createRequire>

declare const require: NodeRequireFunction | undefined

export interface TailwindcssMangleConfigModule {
  initConfig: (cwd: string) => Promise<void>
  CONFIG_NAME: string
}

const MODULE_ID = '@tailwindcss-mangle/config'
type LoaderResult = unknown

let cachedRequire: NodeRequireFunction | undefined

function getNodeRequire() {
  if (cachedRequire) {
    return cachedRequire
  }

  if (typeof require === 'function') {
    cachedRequire = require
    return cachedRequire
  }

  try {
    cachedRequire = createRequire(import.meta.url)
  }
  catch {
    cachedRequire = undefined
  }
  return cachedRequire
}

async function tryDynamicImport(moduleId: string) {
  try {
    return await import(moduleId)
  }
  catch {
    return undefined
  }
}

function tryRequire(moduleId: string) {
  const nodeRequire = getNodeRequire()
  if (!nodeRequire) {
    return undefined
  }
  try {
    return nodeRequire(moduleId)
  }
  catch {
    return undefined
  }
}

function isValidModule(mod: LoaderResult): mod is TailwindcssMangleConfigModule {
  return Boolean(mod)
    && typeof (mod as TailwindcssMangleConfigModule).initConfig === 'function'
    && typeof (mod as TailwindcssMangleConfigModule).CONFIG_NAME === 'string'
}

export async function loadTailwindcssMangleConfig(): Promise<TailwindcssMangleConfigModule | undefined> {
  const mod: LoaderResult = await tryDynamicImport(MODULE_ID) ?? tryRequire(MODULE_ID)
  return isValidModule(mod) ? mod : undefined
}
