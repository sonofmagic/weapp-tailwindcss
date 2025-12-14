import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const projectRoot = path.resolve(import.meta.dirname, '..')
const dataDir = path.resolve(projectRoot, 'data')
const publicDataDir = path.resolve(projectRoot, 'public', 'data')
const outputFile = path.join(publicDataDir, 'index.json')

interface DayBuildData {
  [projectKey: string]: Record<string, number[]>
}

interface DataEntry {
  date: string
  data: DayBuildData
}

async function ensureDir(target: string) {
  await fs.mkdir(target, { recursive: true })
}

async function readEntries(): Promise<DataEntry[]> {
  let files: string[]
  try {
    files = await fs.readdir(dataDir)
  }
  catch (error: any) {
    if (error?.code === 'ENOENT') {
      return []
    }
    throw error
  }
  const candidates = files.filter(name => name.endsWith('.json')).sort((a, b) => a.localeCompare(b))
  const entries: DataEntry[] = []
  for (const filename of candidates) {
    const fullPath = path.join(dataDir, filename)
    const raw = await fs.readFile(fullPath, 'utf8')
    try {
      const parsed = JSON.parse(raw) as DayBuildData
      entries.push({
        date: filename.replace(/\.json$/i, ''),
        data: parsed,
      })
    }
    catch (error: any) {
      console.warn(`[benchmark] Skip invalid JSON ${filename}: ${error?.message ?? error}`)
    }
  }
  return entries
}

async function writeIndex(entries: DataEntry[]) {
  await ensureDir(publicDataDir)
  const payload = {
    generatedAt: new Date().toISOString(),
    entryCount: entries.length,
    entries,
  }
  await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`[benchmark] Wrote ${entries.length} entries -> ${path.relative(projectRoot, outputFile)}`)
}

async function main() {
  const entries = await readEntries()
  await writeIndex(entries)
}

main().catch((error) => {
  console.error('[benchmark] Failed to build data index:', error)
  process.exitCode = 1
})
