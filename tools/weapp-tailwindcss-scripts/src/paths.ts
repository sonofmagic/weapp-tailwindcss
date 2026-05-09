import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)

export const repositoryRoot = path.resolve(currentDir, '../../..')
export const corePackageRoot = path.resolve(repositoryRoot, 'packages/weapp-tailwindcss')

export function resolveCorePackagePath(...segments: string[]) {
  return path.resolve(corePackageRoot, ...segments)
}
