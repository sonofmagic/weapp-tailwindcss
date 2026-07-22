import fs from 'node:fs/promises'
import path from 'pathe'

export async function collectMiniProgramStyleFiles(root: string, extensions: string[]) {
  const styleFiles: string[] = []
  const normalizedExtensions = new Set(extensions.map(extension => extension.toLowerCase()))

  async function visit(directory: string) {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    await Promise.all(entries.map(async (entry) => {
      const target = path.resolve(directory, entry.name)
      if (entry.isDirectory()) {
        await visit(target)
      }
      else if (entry.isFile() && normalizedExtensions.has(path.extname(entry.name).toLowerCase())) {
        styleFiles.push(target)
      }
    }))
  }

  await visit(root)
  return styleFiles.sort()
}
