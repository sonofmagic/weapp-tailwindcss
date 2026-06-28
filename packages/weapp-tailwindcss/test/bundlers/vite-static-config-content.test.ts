import path from 'node:path'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { readStaticConfigContent } from '@/bundlers/vite/static-config-content'

async function writeConfig(source: string) {
  const cwd = await mkdtemp(path.join(tmpdir(), 'weapp-tw-static-config-'))
  const file = path.join(cwd, 'tailwind.config.ts')
  await writeFile(file, source)
  return file
}

describe('vite static config content reader', () => {
  it('reads nested static content arrays and files objects', async () => {
    const file = await writeConfig(`
      export default {
        // comments and whitespace should not affect static parsing
        content: [
          './src/**/*.{vue,ts}',
          { files: ['./components/**/*.wxml', { files: './pages/**/*.vue' }] },
        ],
      }
    `)

    expect(readStaticConfigContent(file)).toEqual([
      './src/**/*.{vue,ts}',
      {
        files: [
          './components/**/*.wxml',
          { files: './pages/**/*.vue' },
        ],
      },
    ])
  })

  it('supports quoted object keys and block comments in static content objects', async () => {
    const file = await writeConfig(`
      export default {
        content: {
          /* keep block comments skippable */
          "files": './src/**/*.wxml',
        },
      }
    `)

    expect(readStaticConfigContent(file)).toEqual({
      files: './src/**/*.wxml',
    })
  })

  it('returns undefined for dynamic or malformed content values', async () => {
    const dynamicFile = await writeConfig('export default { content: getContent() }')
    const templateFile = await writeConfig('export default { content: [`./src/${kind}.vue`] }')
    const missingFilesObject = await writeConfig('export default { content: { relative: true } }')
    const malformedObject = await writeConfig('export default { content: { files: "./src/**/*.vue" relative: true } }')
    const noContentFile = await writeConfig('export default { contentful: ["./src/**/*.vue"] }')
    const unterminatedStringFile = await writeConfig('export default { content: ["./src/**/*.vue] }')
    const unclosedObjectFile = await writeConfig('export default { content: { files: "./src/**/*.vue" }')
    const templateObjectFile = await writeConfig('export default { content: { files: `./src/${kind}.vue` } }')

    expect(readStaticConfigContent(dynamicFile)).toBeUndefined()
    expect(readStaticConfigContent(templateFile)).toBeUndefined()
    expect(readStaticConfigContent(missingFilesObject)).toBeUndefined()
    expect(readStaticConfigContent(malformedObject)).toBeUndefined()
    expect(readStaticConfigContent(noContentFile)).toBeUndefined()
    expect(readStaticConfigContent(unterminatedStringFile)).toBeUndefined()
    expect(readStaticConfigContent(unclosedObjectFile)).toEqual({ files: './src/**/*.vue' })
    expect(readStaticConfigContent(templateObjectFile)).toBeUndefined()
    expect(readStaticConfigContent(path.join(path.dirname(dynamicFile), 'missing.config.ts'))).toBeUndefined()
  })

  it('parses escaped quoted strings and comments inside arrays', async () => {
    const file = await writeConfig(String.raw`
      export default {
        content /* comment */ : [
          './src/**/it\'s.vue',
          // trailing comment
          "./components/**/card\"name.wxml",
        ],
      }
    `)

    expect(readStaticConfigContent(file)).toEqual([
      './src/**/it\'s.vue',
      './components/**/card"name.wxml',
    ])
  })
})
