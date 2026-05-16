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

function readPackageJson<T extends Record<string, unknown>>(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')) as T
}

function readText(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
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
    expect(workflow.jobs.quality.steps.some((step: Record<string, unknown>) => step.name === 'E2E Preprocessor Source')).toBe(true)

    expect(stepRuns(workflow, 'quality')).toEqual(expect.arrayContaining([
      'pnpm install --frozen-lockfile',
      'pnpm lint',
      'pnpm build',
      'pnpm e2e:preprocessor',
      'pnpm test',
    ]))
  })

  it('keeps the preprocessor source demo in local e2e and CI', () => {
    const packageJson = readPackageJson<{ scripts: Record<string, string> }>('package.json')
    const { workflow } = readWorkflow('ci.yml')

    expect(packageJson.scripts['e2e:preprocessor']).toBe('vitest run -c ./e2e/vitest.e2e.config.ts e2e/preprocessor-source.test.ts')
    expect(stepRuns(workflow, 'quality')).toContain('pnpm e2e:preprocessor')
    expect(readText('e2e/preprocessor-source.test.ts')).toContain('@weapp-tailwindcss-demo/weapp-vite-tailwindcss-v4')
    expect(readText('demo/weapp-vite-tailwindcss-v4/app.scss')).toContain('@import "tailwindcss";')
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
    expect(compatibilityRuns).toContain('test/bundlers/vite-plugin.uni-app-x.unit.test.ts')
    expect(compatibilityRuns).toContain('test/watch-hmr-coverage-matrix.unit.test.ts')
  })

  it('keeps test helper private so release jobs do not publish it', () => {
    const packageJson = readPackageJson<{ name: string, private?: boolean }>('packages/test-helper/package.json')

    expect(packageJson.name).toBe('@weapp-tailwindcss/test-helper')
    expect(packageJson.private).toBe(true)
  })

  it('keeps release publishing on npm trusted publishing', () => {
    const { workflow } = readWorkflow('release.yml')
    const setupNodeStep = workflow.jobs.release.steps.find((step: Record<string, unknown>) => {
      return step.uses === 'actions/setup-node@v6'
    })
    const releaseStep = workflow.jobs.release.steps.find((step: Record<string, unknown>) => {
      return step.id === 'changesets'
    })

    expect(setupNodeStep.with['node-version']).toBe(24)
    expect(workflow.permissions['id-token']).toBe('write')
    expect(releaseStep.env.NPM_CONFIG_PROVENANCE).toBe(true)
    expect(releaseStep.env.NPM_TOKEN).toBeUndefined()
    expect(releaseStep.env.NODE_AUTH_TOKEN).toBeUndefined()
  })

  it('runs current vs published benchmark on every ci/cd trigger', () => {
    const { workflow } = readWorkflow('benchmark.yml')
    const packageJson = readPackageJson<{ scripts: Record<string, string> }>('package.json')
    const runs = stepRuns(workflow, 'current-vs-published').join('\n')

    expect(packageJson.scripts['bench:ci']).toBe('node benchmark/version-compare/scripts/run-ci.mjs')
    expect(workflow.on.pull_request.types).toEqual([
      'opened',
      'synchronize',
      'reopened',
      'ready_for_review',
    ])
    expect(workflow.on.push.branches).toEqual([
      'main',
      'alpha',
      'beta',
      'rc',
      'next',
    ])
    expect(workflow.on.workflow_dispatch.inputs.baseline.default).toBe('auto')
    expect(workflow.jobs['current-vs-published']['timeout-minutes']).toBe(180)
    expect(workflow.jobs['current-vs-published'].env.WEAPP_TW_BENCH_BASELINE).toContain('auto')
    expect(runs).toContain('pnpm install --frozen-lockfile')
    expect(runs).toContain('pnpm bench:ci --')
    expect(runs).toContain('--result-dir .tmp/benchmark-ci/result')
    expect(workflow.jobs['current-vs-published'].steps.some((step: Record<string, unknown>) => {
      const withConfig = step.with as Record<string, unknown> | undefined
      return step.uses === 'actions/upload-artifact@v4'
        && withConfig?.name === 'benchmark-current-vs-published'
    })).toBe(true)
  })

  it('keeps published benchmark fixture resolver dependencies explicit', () => {
    const source = readText('benchmark/version-compare/scripts/run-ci.mjs')

    expect(source).toContain('publishedResolverDependencyNames')
    expect(source).toContain('pnpm\', [\'view\', normalizePackageSpec(baseline), \'dependencies\', \'--json\']')
    expect(source).toContain('patchPublishedResolverDependencies(json, resolverDependencies)')
    expect(source).toContain('\'@ast-core/escape\'')
    expect(source).toContain('\'@weapp-core/escape\'')
    expect(source).toContain('\'@weapp-core/regex\'')
  })

  it('keeps local e2e:ide fail-fast and exposes focused case scripts', () => {
    const packageJson = readPackageJson<{ scripts: Record<string, string> }>('package.json')

    expect(packageJson.scripts['e2e:ide']).toContain('vitest run --bail=1')
    expect(packageJson.scripts['e2e:ide:skip-build']).toContain('vitest run --bail=1')
    expect(packageJson.scripts['e2e:ide:case']).toContain('E2E_IDE_PROBE_RETRIES=0')
    expect(packageJson.scripts['e2e:ide:case']).toContain('vitest run --bail=1')
    expect(packageJson.scripts['e2e:ide:case:skip-build']).toContain('E2E_IDE_BUILD=0')
    expect(packageJson.scripts['e2e:ide:case:skip-build']).toContain('E2E_IDE_PROBE_RETRIES=0')
  })
})

describe('e2e watch workflow', () => {
  it('triggers when core package, e2e fixtures, platform demos, scripts, or lockfiles change', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')

    expect(workflow.on.pull_request.paths).toEqual(expect.arrayContaining([
      'packages/weapp-tailwindcss/**',
      'e2e/**',
      'tools/weapp-tailwindcss-scripts/**',
      'demo/**',
      'scripts/**',
      '.github/scripts/**',
      'package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      '.github/workflows/e2e-watch.yml',
      '!website/**',
      '!**/*.md',
      '!.changeset/**',
    ]))
  })

  it('keeps PR quick-gate watch coverage on macOS and Windows', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const rows: Array<Record<string, unknown>> = workflow.jobs['pr-quick-gate'].strategy.matrix.include

    expect(workflow.jobs['pr-quick-gate'].strategy['fail-fast']).toBe(false)
    expect(matrixCases(rows)).toEqual(expect.arrayContaining([
      'macos:22:uni-app-vite-tailwindcss-v3:default',
      'macos:22:mpx-tailwindcss-v3:default',
      'macos:22:taro-webpack-react-tailwindcss-v3:default',
      'macos:22:uni-app-vite-tailwindcss-v3:issue33',
      'macos:22:weapp-vite-tailwindcss-v3:issue33',
      'macos:22:taro-webpack-react-tailwindcss-v4:issue33',
      'macos:22:taro-vite-vue3-tailwindcss-v4:default',
      'macos:22:taro-webpack-vue3-tailwindcss-v4:default',
      'macos:22:uni-app-vite-tailwindcss-v4:default',
      'macos:22:mpx-tailwindcss-v4:default',
      'macos:22:weapp-vite-tailwindcss-v4:issue33',
      'macos:22:weapp-vite-tailwindcss-v3:issue33',
      'windows:22:uni-app-vite-tailwindcss-v3:default',
      'windows:22:mpx-tailwindcss-v3:default',
      'windows:22:taro-webpack-react-tailwindcss-v3:default',
      'windows:22:uni-app-vite-tailwindcss-v3:issue33',
      'windows:22:weapp-vite-tailwindcss-v3:issue33',
      'windows:22:taro-webpack-react-tailwindcss-v4:issue33',
      'windows:22:taro-vite-vue3-tailwindcss-v4:default',
      'windows:22:mpx-tailwindcss-v4:default',
      'windows:22:weapp-vite-tailwindcss-v4:issue33',
      'windows:22:weapp-vite-tailwindcss-v3:issue33',
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
      'macos:24:weapp-vite-tailwindcss-v3:issue33',
      'windows:24:weapp-vite-tailwindcss-v3:issue33',
    ]))
    expect(stepRuns(workflow, 'nightly-full-regression')).toContain('pnpm e2e:watch')
  })

  it('keeps explicit plugin processing budgets for e2e watch rows while allowing longer startup timeouts', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const prRows: Array<Record<string, unknown>> = workflow.jobs['pr-quick-gate'].strategy.matrix.include
    const nightlyRows: Array<Record<string, unknown>> = workflow.jobs['nightly-full-regression'].strategy.matrix.include

    const slowMacosWeappViteBudget = {
      os: 'macos-latest',
      runner_label: 'macos',
      watch_case: 'weapp-vite-tailwindcss-v3',
      round_profile: 'issue33',
      timeout_minutes: 60,
      watch_timeout_ms: '600000',
      watch_max_plugin_process_ms: '6000',
      watch_command_timeout_ms: '1500000',
    }
    const slowWindowsPrBudgets = [
      {
        watch_case: 'uni-app-vite-tailwindcss-v3',
        round_profile: 'default',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_command_timeout_ms: '1500000',
      },
      {
        watch_case: 'taro-webpack-react-tailwindcss-v3',
        round_profile: 'default',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_command_timeout_ms: '1500000',
      },
      {
        watch_case: 'uni-app-vite-tailwindcss-v3',
        round_profile: 'issue33',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_command_timeout_ms: '1500000',
      },
      {
        watch_case: 'taro-webpack-react-tailwindcss-v4',
        round_profile: 'issue33',
        timeout_minutes: 70,
        watch_timeout_ms: '600000',
        watch_command_timeout_ms: '1800000',
      },
      {
        watch_case: 'taro-vite-vue3-tailwindcss-v4',
        round_profile: 'default',
        timeout_minutes: 70,
        watch_timeout_ms: '600000',
        watch_command_timeout_ms: '1800000',
      },
      {
        watch_case: 'mpx-tailwindcss-v4',
        round_profile: 'default',
        timeout_minutes: 60,
        watch_timeout_ms: '600000',
        watch_command_timeout_ms: '1500000',
      },
    ]
    const slowMacosUniAppPrBudgets = [
      {
        watch_case: 'uni-app-vite-tailwindcss-v3',
        round_profile: 'default',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_command_timeout_ms: '1500000',
      },
      {
        watch_case: 'uni-app-vite-tailwindcss-v3',
        round_profile: 'issue33',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_command_timeout_ms: '1500000',
      },
    ]
    const slowWeappViteV4PrBudgets = [
      {
        os: 'macos-latest',
        runner_label: 'macos',
        timeout_minutes: 40,
        watch_timeout_ms: '280000',
        watch_max_plugin_process_ms: '6000',
        watch_command_timeout_ms: '720000',
      },
      {
        os: 'windows-latest',
        runner_label: 'windows',
        timeout_minutes: 45,
        watch_timeout_ms: '320000',
        watch_max_plugin_process_ms: '6000',
        watch_command_timeout_ms: '840000',
      },
    ]

    expect(prRows).toContainEqual(expect.objectContaining(slowMacosWeappViteBudget))
    for (const budget of slowMacosUniAppPrBudgets) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'macos-latest',
        runner_label: 'macos',
        ...budget,
      }))
    }
    for (const budget of slowWindowsPrBudgets) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'windows-latest',
        runner_label: 'windows',
        ...budget,
      }))
    }
    for (const budget of slowWeappViteV4PrBudgets) {
      expect(prRows).toContainEqual(expect.objectContaining({
        watch_case: 'weapp-vite-tailwindcss-v4',
        round_profile: 'issue33',
        ...budget,
      }))
    }
    expect(nightlyRows).toContainEqual(expect.objectContaining(slowMacosWeappViteBudget))
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      ...slowMacosWeappViteBudget,
      'node-version': 24,
    }))
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      os: 'macos-latest',
      runner_label: 'macos',
      watch_case: 'demo',
      round_profile: 'default',
      timeout_minutes: 120,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '15000',
      watch_command_timeout_ms: '5400000',
    }))
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      os: 'windows-latest',
      runner_label: 'windows',
      watch_case: 'demo',
      round_profile: 'default',
      timeout_minutes: 150,
      watch_timeout_ms: '540000',
      watch_max_plugin_process_ms: '15000',
      watch_command_timeout_ms: '7200000',
    }))
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      os: 'macos-latest',
      runner_label: 'macos',
      watch_case: 'all',
      round_profile: 'default',
      timeout_minutes: 150,
      watch_timeout_ms: '600000',
      watch_max_plugin_process_ms: '15000',
      watch_command_timeout_ms: '7200000',
    }))
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      os: 'windows-latest',
      runner_label: 'windows',
      watch_case: 'all',
      round_profile: 'default',
      timeout_minutes: 180,
      watch_timeout_ms: '1200000',
      watch_max_plugin_process_ms: '15000',
      watch_command_timeout_ms: '9000000',
    }))
  })

  it('keeps the CI e2e watch plugin processing fallback budget at 6000ms', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')

    const prRunStep = workflow.jobs['pr-quick-gate'].steps.find((step: Record<string, unknown>) => {
      return step.name === 'Run e2e watch suite (PR quick gate)'
    })
    const nightlyRunStep = workflow.jobs['nightly-full-regression'].steps.find((step: Record<string, unknown>) => {
      return step.name === 'Run e2e watch suite (nightly/full)'
    })

    expect(prRunStep.env.E2E_WATCH_MAX_PLUGIN_PROCESS_MS).toBe("${{ matrix.watch_max_plugin_process_ms || '6000' }}")
    expect(nightlyRunStep.env.E2E_WATCH_MAX_PLUGIN_PROCESS_MS).toBe("${{ matrix.watch_max_plugin_process_ms || '6000' }}")
    expect(prRunStep.env.E2E_WATCH_MAX_ATTEMPTS).toBe("${{ matrix.watch_max_attempts || '2' }}")
    expect(nightlyRunStep.env.E2E_WATCH_MAX_ATTEMPTS).toBe("${{ matrix.watch_max_attempts || '2' }}")
  })

  it('keeps any explicit e2e watch plugin processing matrix budget within 15000ms', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const rows: Array<Record<string, unknown>> = [
      ...workflow.jobs['pr-quick-gate'].strategy.matrix.include,
      ...workflow.jobs['nightly-full-regression'].strategy.matrix.include,
    ]

    for (const row of rows) {
      const budget = row.watch_max_plugin_process_ms
      if (budget == null) {
        continue
      }
      expect(Number(budget), `${row.runner_label}:${row.watch_case}:${row.round_profile}`).toBeLessThanOrEqual(15000)
    }
  })

  it('uses node-version specific artifact names for matrix rows that share case names', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const uploadSteps = [
      ...workflow.jobs['pr-quick-gate'].steps,
      ...workflow.jobs['nightly-full-regression'].steps,
    ].filter((step: Record<string, unknown>) => step.uses === 'actions/upload-artifact@v4')

    expect(uploadSteps.length).toBe(4)
    for (const step of uploadSteps) {
      expect(step.with?.name).toContain("node${{ matrix['node-version'] || 22 }}")
    }
  })

  it('publishes HMR speed report in every watch job summary and artifact', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const jobs = [
      workflow.jobs['pr-quick-gate'],
      workflow.jobs['nightly-full-regression'],
    ]

    for (const job of jobs) {
      const runs = stepRuns({ jobs: { target: job } }, 'target').join('\n')
      expect(runs).toContain('node .github/scripts/e2e-watch-report.cjs job-summary')
      expect(job.steps.some((step: Record<string, unknown>) => {
        const withConfig = step.with as Record<string, unknown> | undefined
        return step.uses === 'actions/upload-artifact@v4'
          && typeof withConfig?.path === 'string'
          && withConfig.path.includes('e2e/benchmark/e2e-watch-hmr/hmr-speed-report.md')
      })).toBe(true)
    }
  })
})
