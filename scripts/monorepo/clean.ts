import path from 'pathe'
import { rimraf } from 'rimraf'

const dirs = [
  'packages/monorepo',
  'packages/foo',
  // 'apps/cli',
  // 'apps/website',
  'apps',
]

await rimraf(dirs.map((x) => {
  return path.resolve(import.meta.dirname, '..', x)
}))
