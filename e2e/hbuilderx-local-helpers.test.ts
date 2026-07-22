import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'pathe'
import { collectMiniProgramStyleFiles } from './hbuilderx-local/styles'

describe('HBuilderX local helpers', () => {
  it('collects platform style files recursively without assuming output filenames', async () => {
    const root = await fs.mkdtemp(path.resolve(os.tmpdir(), 'hbuilderx-styles-'))
    try {
      await fs.mkdir(path.resolve(root, 'sub-normal/pages'), { recursive: true })
      await fs.mkdir(path.resolve(root, 'sub-independent/pages'), { recursive: true })
      await Promise.all([
        fs.writeFile(path.resolve(root, 'app.css'), '.app {}'),
        fs.writeFile(path.resolve(root, 'sub-normal/pages/index.css'), '.normal {}'),
        fs.writeFile(path.resolve(root, 'sub-independent/pages/index.css'), '.independent {}'),
        fs.writeFile(path.resolve(root, 'sub-normal/pages/index.js'), 'export {}'),
      ])

      const files = await collectMiniProgramStyleFiles(root, ['.css'])
      expect(files.map(file => path.relative(root, file))).toEqual([
        'app.css',
        'sub-independent/pages/index.css',
        'sub-normal/pages/index.css',
      ])
    }
    finally {
      await fs.rm(root, { force: true, recursive: true })
    }
  })
})
