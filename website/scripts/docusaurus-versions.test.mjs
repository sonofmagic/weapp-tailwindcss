import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(currentDir, '../package.json'), 'utf8'),
)

describe('Docusaurus dependencies', () => {
  it('keeps official packages aligned with core', () => {
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }
    const coreVersion = dependencies['@docusaurus/core']
    const officialPackages = Object.entries(dependencies)
      .filter(([name]) => name.startsWith('@docusaurus/'))

    expect(coreVersion).toBeDefined()
    expect(officialPackages.length).toBeGreaterThan(1)
    expect(officialPackages).toEqual(
      officialPackages.map(([name]) => [name, coreVersion]),
    )
  })
})
