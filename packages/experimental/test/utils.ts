import fs from 'fs-extra'
import path from 'pathe'

export function getFixture(...paths: string[]) {
  return fs.readFile(path.resolve(__dirname, 'fixtures', ...paths), 'utf8')
}

export const legacyCssTarget = 'chrome61'

export const ESBUILD_BASELINE_WIDELY_AVAILABLE_TARGET = [
  'chrome107',
  'edge107',
  'firefox104',
  'safari16',
]
