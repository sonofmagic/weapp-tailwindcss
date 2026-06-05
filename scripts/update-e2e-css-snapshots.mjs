import fs from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'pathe'
import { E2E_PROJECTS } from '../e2e/projectEntries.js'
import { getProjectCssSnapshotFiles } from '../e2e/shared.js'
import { collectCssSnapshots } from '../e2e/snapshotUtils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const e2eRoot = path.resolve(repoRoot, 'e2e')

const LEADING_SEPARATORS_RE = /^[\\/]+/

async function resolveSnapshotFile(testDir, suite, projectName, fileName) {
  const snapshotDir = path.resolve(testDir, '__snapshots__', suite, projectName)
  await fs.mkdir(snapshotDir, { recursive: true })
  const sanitizedName = fileName.replace(LEADING_SEPARATORS_RE, '')
  const snapshotPath = path.resolve(snapshotDir, sanitizedName)
  const relative = path.relative(snapshotDir, snapshotPath)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid snapshot file name: ${fileName}`)
  }
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true })
  return snapshotPath
}

async function updateSuite(config) {
  const projectBase = path.resolve(repoRoot, config.fixturesDir)

  for (const project of config.projects) {
    const projectRoot = path.resolve(projectBase, project.projectPath)
    let updated = 0

    for (const cssEntry of getProjectCssSnapshotFiles(project)) {
      try {
        await fs.access(path.resolve(projectRoot, cssEntry.cssFile))
      }
      catch (error) {
        const code = error?.code
        if (code === 'ENOENT' || code === 'EPERM') {
          process.stdout.write(`[e2e] skipped ${config.suite}/${project.name} CSS snapshot: ${cssEntry.cssFile} not found\n`)
          continue
        }
        throw error
      }

      const cssSnapshots = await collectCssSnapshots(projectRoot, cssEntry.cssFile, {
        rootSnapshotName: cssEntry.snapshotName,
      })

      for (const snapshot of cssSnapshots) {
        const snapshotPath = await resolveSnapshotFile(e2eRoot, config.suite, project.name, snapshot.fileName)
        await fs.writeFile(snapshotPath, snapshot.content, 'utf8')
        updated++
      }
    }

    if (updated === 0) {
      process.stdout.write(`[e2e] skipped ${config.suite}/${project.name} CSS snapshots: no CSS snapshots found\n`)
      continue
    }

    process.stdout.write(`[e2e] updated ${config.suite}/${project.name} CSS snapshots (${updated})\n`)
  }
}

async function main() {
  const suites = [
    {
      suite: 'e2e',
      fixturesDir: '../demo',
      projects: E2E_PROJECTS,
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
