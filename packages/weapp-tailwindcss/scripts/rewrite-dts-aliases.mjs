import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const filepath = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(filepath)
    }
    else if (/\.d\.[cm]?ts$/.test(entry.name) || entry.name.endsWith('.d.ts')) {
      yield filepath
    }
  }
}

function toModulePath(filepath, aliasTarget) {
  const target = join(distDir, aliasTarget)
  let value = relative(dirname(filepath), target).split(sep).join('/')
  if (!value.startsWith('.')) {
    value = `./${value}`
  }
  return value
}

for await (const filepath of walk(distDir)) {
  const content = await readFile(filepath, 'utf8')
  const next = content.replace(/from\s+(['"])@\/([^'"]+)\1/g, (match, quote, aliasTarget) => {
    return `from ${quote}${toModulePath(filepath, aliasTarget)}${quote}`
  })
  if (next !== content) {
    await writeFile(filepath, next, 'utf8')
  }
}
