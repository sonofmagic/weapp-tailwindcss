import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { readReachableMiniProgramStyles, resolveMiniProgramRuntimeStyleEntry } from './hbuilderx-local/styles'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => fs.rm(directory, { recursive: true, force: true })))
})

async function createFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'weapp-tailwindcss-hbuilderx-styles-'))
  temporaryDirectories.push(root)
  await fs.writeFile(path.join(root, 'entry.js'), '')
  await fs.writeFile(path.join(root, 'entry.acss'), '@import "./framework.acss";\n.runtime{}')
  await fs.writeFile(path.join(root, 'framework.acss'), '@import "./generated.acss";')
  await fs.writeFile(path.join(root, 'generated.acss'), '@import "./framework.acss";\n.tailwind{}')
  await fs.writeFile(path.join(root, 'unlinked.acss'), '.unlinked{}')
  return root
}

describe('HBuilderX mini-program style reachability', () => {
  it('resolves the runtime style from the root chunk and follows local imports', async () => {
    const root = await createFixture()
    const entry = await resolveMiniProgramRuntimeStyleEntry(root, ['.acss'])

    expect(entry).toBe(path.join(root, 'entry.acss'))
    const css = await readReachableMiniProgramStyles(root, entry!, ['.acss'])
    expect(css).toContain('.runtime{}')
    expect(css).toContain('.tailwind{}')
    expect(css).not.toContain('.unlinked{}')
  })

  it('does not follow imports outside the output root', async () => {
    const root = await createFixture()
    const external = path.join(path.dirname(root), 'external.acss')
    await fs.writeFile(external, '.external{}')
    await fs.appendFile(path.join(root, 'entry.acss'), '\n@import "../external.acss";')
    try {
      const css = await readReachableMiniProgramStyles(root, path.join(root, 'entry.acss'), ['.acss'])
      expect(css).not.toContain('.external{}')
    }
    finally {
      await fs.rm(external, { force: true })
    }
  })
})
