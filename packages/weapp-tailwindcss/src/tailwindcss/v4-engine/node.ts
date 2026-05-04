import type { TailwindV4NodeModule } from './types'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)

let tailwindNodeModulePromise: Promise<TailwindV4NodeModule> | undefined

export async function importTailwindV4NodeModule(): Promise<TailwindV4NodeModule> {
  if (!tailwindNodeModulePromise) {
    tailwindNodeModulePromise = (async () => {
      try {
        const resolved = require.resolve('@tailwindcss/node')
        return await import(resolved) as TailwindV4NodeModule
      }
      catch {
        const tailwindcssPatchEntry = require.resolve('tailwindcss-patch')
        const resolved = require.resolve('@tailwindcss/node', {
          paths: [path.dirname(tailwindcssPatchEntry)],
        })
        return await import(resolved) as TailwindV4NodeModule
      }
    })()
  }
  return tailwindNodeModulePromise
}
