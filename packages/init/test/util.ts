import type { FetchOptions } from 'npm-registry-fetch'
import fs from 'fs-extra'
import { resolve } from 'pathe'

export const npmmirrorRegistry = 'https://registry.npmmirror.com'

export const fetchOptions: FetchOptions = {
  registry: npmmirrorRegistry,
}

export const fixturesRootPath = resolve(__dirname, 'fixtures')

export async function createTempFixture(name: string, packageJson: Record<string, unknown>) {
  const tempRoot = resolve(process.cwd(), 'node_modules/.test-tmp')
  await fs.ensureDir(tempRoot)
  const root = await fs.mkdtemp(resolve(tempRoot, `${name}-`))
  await fs.writeJSON(resolve(root, 'package.json'), packageJson, { spaces: 2 })
  return root
}
