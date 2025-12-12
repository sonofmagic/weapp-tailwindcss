import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'pathe'
import prettier from 'prettier'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const e2eRoot = path.resolve(repoRoot, 'e2e')

const TAILWIND_BANNER = /^\s*\/\*! tailwindcss v[\d.]+ \| MIT License \| https:\/\/tailwindcss\.com \*\/\s*/i

async function loadProjectEntries() {
  const sourcePath = path.resolve(e2eRoot, 'projectEntries.ts')
  const source = await fs.readFile(sourcePath, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
    fileName: sourcePath,
  })

  const dataUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
  const mod = await import(dataUrl)

  return {
    e2eProjects: mod.E2E_PROJECTS ?? [],
    nativeProjects: mod.NATIVE_PROJECTS ?? [],
  }
}

async function exists(target) {
  try {
    await fs.access(target)
    return true
  }
  catch {
    return false
  }
}

function sanitizeImportRequest(request) {
  const withoutQuery = request.split('?')[0] ?? ''
  const withoutHash = withoutQuery.split('#')[0] ?? ''
  return withoutHash.trim()
}

function normalizeSnapshotName(name) {
  const segments = name.split(/[/\\]+/).filter(segment => segment.length > 0 && segment !== '.')
  if (segments.length === 0) {
    return undefined
  }
  return segments.join(path.sep)
}

function safeRelative(from, to) {
  const relativePath = path.relative(from, to)
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return undefined
  }
  return relativePath
}

function resolveCssImport(projectRoot, fromFile, request) {
  const cleaned = sanitizeImportRequest(request)
  if (!cleaned || cleaned.startsWith('~')) {
    return undefined
  }
  if (/^(?:https?:)?\/\//i.test(cleaned) || cleaned.startsWith('data:')) {
    return undefined
  }

  const fromDir = path.dirname(fromFile)
  const normalizedRequest = cleaned.replace(/\\/g, '/')

  const target = normalizedRequest.startsWith('/')
    ? path.resolve(projectRoot, `.${normalizedRequest}`)
    : path.resolve(fromDir, normalizedRequest)

  return target
}

function computeSnapshotName(projectRoot, fromFile, targetFile) {
  const fromDir = path.dirname(fromFile)

  const relativeFromCurrent = safeRelative(fromDir, targetFile)
  if (relativeFromCurrent) {
    const normalized = normalizeSnapshotName(relativeFromCurrent)
    if (normalized) {
      return normalized
    }
  }

  const relativeFromProject = safeRelative(projectRoot, targetFile)
  if (relativeFromProject) {
    const normalized = normalizeSnapshotName(relativeFromProject)
    if (normalized) {
      return normalized
    }
  }

  return path.basename(targetFile)
}

function extractCssImports(source) {
  const pattern = /@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^"'()\s]+))\s*\)?/gi
  const imports = []
  while (true) {
    const match = pattern.exec(source)
    if (!match) {
      break
    }
    const request = (match[1] ?? match[2] ?? match[3] ?? '').trim()
    if (request.length === 0) {
      continue
    }
    imports.push(request)
  }
  return imports
}

function stripTailwindBanner(source) {
  return source.replace(TAILWIND_BANNER, '')
}

async function formatCss(css) {
  return prettier.format(css, {
    parser: 'css',
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'none',
    printWidth: 180,
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  })
}

async function collectCssSnapshots(projectRoot, cssRelativePath) {
  const rootCssPath = path.resolve(projectRoot, cssRelativePath)
  const visited = new Set()
  const snapshots = []

  async function visit(targetPath, snapshotName) {
    const normalizedPath = path.normalize(targetPath)
    if (visited.has(normalizedPath)) {
      return
    }

    if (!(await exists(normalizedPath))) {
      return
    }

    visited.add(normalizedPath)

    const source = await fs.readFile(normalizedPath, 'utf8')
    const withoutBanner = stripTailwindBanner(source)
    const formatted = await formatCss(withoutBanner)

    snapshots.push({
      fileName: snapshotName,
      content: formatted,
    })

    const imports = extractCssImports(withoutBanner)
    for (const request of imports) {
      const resolved = resolveCssImport(projectRoot, normalizedPath, request)
      if (!resolved) {
        continue
      }
      const nextSnapshotName = computeSnapshotName(projectRoot, normalizedPath, resolved)
      if (!nextSnapshotName) {
        continue
      }
      await visit(resolved, nextSnapshotName)
    }
  }

  await visit(rootCssPath, path.basename(cssRelativePath))
  return snapshots
}

async function resolveSnapshotFile(testDir, suite, projectName, fileName) {
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

async function updateSuite(config) {
  const projectBase = path.resolve(e2eRoot, config.fixturesDir)

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
  const { e2eProjects, nativeProjects } = await loadProjectEntries()

  const suites = [
    {
      suite: 'e2e',
      fixturesDir: '../demo',
      projects: e2eProjects,
    },
    {
      suite: 'native',
      fixturesDir: '../apps',
      projects: nativeProjects,
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
