import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { corePackageRoot } from './paths'

const root = corePackageRoot

const entryShims = {
  'css-macro.d.ts': { target: './css-macro/index', defaultExport: true },
  'framework.d.ts': { target: './framework/index' },
  'generator.d.ts': { target: './generator/index' },
  'reset.d.ts': { target: './reset/index', defaultExport: true },
  'types.d.ts': { target: './types/index' },
}

async function main() {
  await Promise.all(Object.entries(entryShims).map(async ([filename, { defaultExport = false, target }]) => {
    const filepath = join(root, 'dist', filename)
    await mkdir(dirname(filepath), { recursive: true })
    const content = defaultExport
      ? `export { default } from '${target}'\nexport * from '${target}'\n`
      : `export * from '${target}'\n`
    await writeFile(filepath, content, 'utf8')
  }))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
