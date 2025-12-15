import type { ProjectEntry } from '../e2e/shared'
import fs from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'pathe'
import { E2E_PROJECTS, NATIVE_PROJECTS } from '../e2e/projectEntries'
import { collectCssSnapshots } from '../e2e/snapshotUtils'

interface SuiteConfig {
  suite: string
  fixturesDir: string
  projects: ProjectEntry[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const e2eRoot = path.resolve(repoRoot, 'e2e')

async function resolveSnapshotFile(testDir: string, suite: string, projectName: string, fileName: string) {
  const snapshotDir = path.resolve(testDir, '__snapshots__', suite, projectName)
  await fs.mkdir(snapshotDir, { recursive: true })
  const sanitizedName = fileName.replace(/^[\\/]+/, '')
  const snapshotPath = path.resolve(snapshotDir, sanitizedName)
  const relative = path.relative(snapshotDir, snapshotPath)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid snapshot file name: ${fileName}`)
  }
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true })
  return snapshotPath
}

async function updateSuite(config: SuiteConfig) {
  const projectBase = path.resolve(repoRoot, config.fixturesDir)

  for (const project of config.projects) {
    const projectRoot = path.resolve(projectBase, project.projectPath)
    const cssSnapshots = await collectCssSnapshots(projectRoot, project.cssFile)

    for (const snapshot of cssSnapshots) {
      const snapshotPath = await resolveSnapshotFile(e2eRoot, config.suite, project.name, snapshot.fileName)
      await fs.writeFile(snapshotPath, snapshot.content, 'utf8')
    }

    process.stdout.write(`[e2e] updated ${config.suite}/${project.name} CSS snapshots\n`)
  }
}

async function main() {
  const suites: SuiteConfig[] = [
    {
      suite: 'e2e',
      fixturesDir: '../demo',
      projects: E2E_PROJECTS,
    },
    {
      suite: 'native',
      fixturesDir: '../apps',
      projects: NATIVE_PROJECTS,
    },
  ]

  for (const suite of suites) {
    await updateSuite(suite)
  }
}

main().catch((error) => {
  console.error('[e2e] failed to update CSS snapshots', error)
  process.exit(1)
})
