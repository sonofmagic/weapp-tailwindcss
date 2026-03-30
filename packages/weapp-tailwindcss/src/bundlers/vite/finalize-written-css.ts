import type { ResolvedConfig } from 'vite'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createFallbackPlaceholderReplacer } from '@weapp-tailwindcss/postcss'

const CSS_OUTPUT_EXTENSIONS = new Set(['.css', '.wxss', '.acss', '.ttss', '.jxss', '.qss'])

async function collectCssOutputFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectCssOutputFiles(absolutePath))
      continue
    }
    if (entry.isFile() && CSS_OUTPUT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath)
    }
  }

  return files
}

export async function cleanFinalWrittenCssAssets(
  config: ResolvedConfig | undefined,
  debug: (format: string, ...args: unknown[]) => void,
) {
  if (!config || config.command !== 'build') {
    return
  }

  const rootDir = config.root ? path.resolve(config.root) : process.cwd()
  const outDir = config.build?.outDir
    ? path.resolve(rootDir, config.build.outDir)
    : rootDir
  const replaceFallbackPlaceholder = createFallbackPlaceholderReplacer()
  const files = await collectCssOutputFiles(outDir)

  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const cleaned = replaceFallbackPlaceholder(raw)
    if (cleaned === raw) {
      continue
    }
    await writeFile(file, cleaned, 'utf8')
    debug('final css cleanup: %s', path.relative(outDir, file))
  }
}
