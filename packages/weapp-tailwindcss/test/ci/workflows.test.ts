import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import YAML from 'yaml'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(dirname, '../../../..')
const workflowsRoot = path.join(repoRoot, '.github/workflows')

function readWorkflow(filename: string) {
  const source = fs.readFileSync(path.join(workflowsRoot, filename), 'utf8')
  return {
    source,
    workflow: YAML.parse(source) as Record<string, any>,
  }
}

function stepRuns(workflow: Record<string, any>, jobName: string) {
  const steps: Array<Record<string, unknown>> = workflow.jobs[jobName].steps
  return steps
    .map(step => step.run)
    .filter((run): run is string => typeof run === 'string')
}

function extractJsonArrays(source: string) {
  return [...source.matchAll(/\[\{.*?\}\]/g)].map((match) => {
    return JSON.parse(match[0]) as Array<Record<string, unknown>>
  })
}

function matrixIds(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => {
    return `${row.os}:${row['node-version']}:${row.scenario}`
  })
}

function matrixCases(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => {
    const nodeVersion = row['node-version'] ?? 22
    return `${row.runner_label}:${nodeVersion}:${row.watch_case}:${row.round_profile}`
  })
}

describe('ci workflows', () => {
  it('keeps the core CI quality gate on package changes', () => {
    const { workflow } = readWorkflow('ci.yml')

    expect(workflow.on.pull_request['paths-ignore']).toEqual([
      '**/*.md',
      '.changeset/**',
    ])
    expect(workflow.jobs.quality.steps.some((step: Record<string, unknown>) => step.name === 'E2E Static')).toBe(true)

    expect(stepRuns(workflow, 'quality')).toEqual(expect.arrayContaining([
      'pnpm install --frozen-lockfile',
      'pnpm lint',
      'pnpm build',
      'pnpm test',
    ]))
  })

  it('keeps workflow_dispatch compatibility coverage across OS and Node versions', () => {
    const { source, workflow } = readWorkflow('ci.yml')
    const [workflowDispatchRows, pullRequestRows] = extractJsonArrays(source)

    expect(workflow.jobs.compatibility.strategy['fail-fast']).toBe(false)
    expect(matrixIds(workflowDispatchRows)).toEqual(expect.arrayContaining([
      'ubuntu-latest:20:node20-core',
      'ubuntu-latest:24:node24-core',
      'windows-latest:20:windows-node20-core',
      'windows-latest:22:windows-node22-core',
      'windows-latest:24:windows-node24-core',
      'macos-latest:22:macos-node22-core',
    ]))
    expect(matrixIds(pullRequestRows)).toEqual([
      'windows-latest:22:windows-node22-core',
    ])

    const compatibilityRuns = stepRuns(workflow, 'compatibility').join('\n')
    expect(compatibilityRuns).toContain('pnpm --filter weapp-tailwindcss... run build')
    expect(compatibilityRuns).toContain('test/cli/postinstall.test.ts')
    expect(compatibilityRuns).toContain('test/bundlers/vite-plugin.uni-app-x.unit.test.ts')
    expect(compatibilityRuns).toContain('test/watch-hmr-coverage-matrix.unit.test.ts')
  })
})

describe('e2e watch workflow', () => {
  it('triggers when core package, platform demos, scripts, or lockfiles change', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')

    expect(workflow.on.pull_request.paths).toEqual(expect.arrayContaining([
      'packages/weapp-tailwindcss/**',
      'e2e/watch/**',
      'demo/**',
      'apps/**',
      'scripts/**',
      'pnpm-lock.yaml',
      '.github/workflows/e2e-watch.yml',
    ]))
  })

  it('keeps PR quick-gate watch coverage on macOS and Windows', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const rows: Array<Record<string, unknown>> = workflow.jobs['pr-quick-gate'].strategy.matrix.include

    expect(workflow.jobs['pr-quick-gate'].strategy['fail-fast']).toBe(false)
    expect(matrixCases(rows)).toEqual(expect.arrayContaining([
      'macos:22:uni:default',
      'macos:22:mpx:default',
      'macos:22:taro:default',
      'macos:22:uni-app-vue3-vite:issue33',
      'macos:22:weapp-vite:issue33',
      'macos:22:taro-webpack:issue33',
      'macos:22:vite-native-ts:issue33',
      'windows:22:uni:default',
      'windows:22:mpx:default',
      'windows:22:taro:default',
      'windows:22:uni-app-vue3-vite:issue33',
      'windows:22:weapp-vite:issue33',
      'windows:22:taro-webpack:issue33',
      'windows:22:vite-native-ts:issue33',
    ]))
    expect(stepRuns(workflow, 'pr-quick-gate')).toContain('pnpm e2e:watch')
  })

  it('keeps nightly full-regression coverage for broad cases and Node 24 probes', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const rows: Array<Record<string, unknown>> = workflow.jobs['nightly-full-regression'].strategy.matrix.include

    expect(workflow.jobs['nightly-full-regression'].strategy['fail-fast']).toBe(false)
    expect(matrixCases(rows)).toEqual(expect.arrayContaining([
      'macos:22:all:default',
      'windows:22:all:default',
      'macos:22:demo:default',
      'windows:22:demo:default',
      'macos:22:apps:default',
      'windows:22:apps:default',
      'macos:24:weapp-vite:issue33',
      'windows:24:vite-native-ts:issue33',
    ]))
    expect(stepRuns(workflow, 'nightly-full-regression')).toContain('pnpm e2e:watch')
  })
})
