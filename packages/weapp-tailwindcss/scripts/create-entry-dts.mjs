import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const entryShims = {
  'css-macro.d.ts': './css-macro/index',
  'generator.d.ts': './generator/index',
  'reset.d.ts': './reset/index',
  'types.d.ts': './types/index',
}

await Promise.all(Object.entries(entryShims).map(async ([filename, target]) => {
  const filepath = join(root, 'dist', filename)
  await mkdir(dirname(filepath), { recursive: true })
  await writeFile(filepath, `export * from '${target}'\n`, 'utf8')
}))
