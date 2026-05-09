import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const entryShims = {
  'css-macro.d.ts': { target: './css-macro/index', defaultExport: true },
  'generator.d.ts': { target: './generator/index' },
  'reset.d.ts': { target: './reset/index', defaultExport: true },
  'types.d.ts': { target: './types/index' },
}

await Promise.all(Object.entries(entryShims).map(async ([filename, { defaultExport = false, target }]) => {
  const filepath = join(root, 'dist', filename)
  await mkdir(dirname(filepath), { recursive: true })
  const content = defaultExport
    ? `export { default } from '${target}'\nexport * from '${target}'\n`
    : `export * from '${target}'\n`
  await writeFile(filepath, content, 'utf8')
}))
