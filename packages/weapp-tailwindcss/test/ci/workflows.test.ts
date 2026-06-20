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

function readDemoPackageJsons() {
  const demoRoot = path.join(repoRoot, 'demo')
  return fs.readdirSync(demoRoot)
    .map(project => ({
      project,
      packageJsonPath: path.join(demoRoot, project, 'package.json'),
    }))
    .filter(entry => fs.existsSync(entry.packageJsonPath))
    .map(entry => ({
      project: entry.project,
      packageJson: JSON.parse(fs.readFileSync(entry.packageJsonPath, 'utf8')) as {
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
        scripts?: Record<string, string>
      },
    }))
}

function stepRuns(workflow: Record<string, any>, jobName: string) {
  const steps: Array<Record<string, unknown>> = workflow.jobs[jobName].steps
  return steps
    .map(step => step.run)
    .filter((run): run is string => typeof run === 'string')
}

function hasStepRunCommand(runs: string[], command: string) {
  return runs.some(run => run === command || run.includes(`-- ${command}`))
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

function matrixCaseNames(rows: Array<Record<string, unknown>>) {
  return rows.map(row => row.case_name)
}

describe('ci workflows', () => {
  it('keeps the core CI quality gate on package changes', () => {
    const { workflow } = readWorkflow('ci.yml')

    expect(workflow.on.pull_request['paths-ignore']).toEqual([
      '**/*.md',
      '.changeset/**',
    ])
    expect(workflow.jobs.quality.steps.some((step: Record<string, unknown>) => {
      return typeof step.name === 'string' && step.name.startsWith('E2E ')
    })).toBe(false)

    const qualityRuns = stepRuns(workflow, 'quality')
    expect(qualityRuns).toEqual(expect.arrayContaining([
      'pnpm install --frozen-lockfile',
      'pnpm lint',
    ]))
    expect(hasStepRunCommand(qualityRuns, 'pnpm build:ci')).toBe(true)
    expect(hasStepRunCommand(qualityRuns, 'pnpm test:release')).toBe(true)
  })

  it('keeps heavyweight e2e checks parallel to the quality gate', () => {
    const { workflow } = readWorkflow('ci.yml')
    const qualityRuns = stepRuns(workflow, 'quality')
    const staticRuns = stepRuns(workflow, 'e2e-static')
    const focusedRuns = stepRuns(workflow, 'e2e-focused')
    const multiplatformRuns = stepRuns(workflow, 'e2e-multiplatform')
    const staticJob = workflow.jobs['e2e-static']
    const focusedRows: Array<Record<string, unknown>> = workflow.jobs['e2e-focused'].strategy.matrix.include
    const multiplatformRows: Array<Record<string, unknown>> = workflow.jobs['e2e-multiplatform'].strategy.matrix.include

    expect(qualityRuns).not.toContain('pnpm build')
    expect(staticRuns).not.toContain('pnpm build')
    expect(focusedRuns).not.toContain('pnpm build')
    expect(multiplatformRuns).not.toContain('pnpm build')
    expect(hasStepRunCommand(qualityRuns, 'pnpm build:ci')).toBe(true)
    expect(staticJob['timeout-minutes']).toBe(15)
    expect(staticJob.strategy['fail-fast']).toBe(false)
    expect(staticJob.strategy.matrix.shard).toEqual([1, 2, 3])
    expect(staticJob.strategy.matrix.shard_total).toEqual([3])
    expect(staticRuns).toContain('pnpm exec playwright install chromium')
    expect(hasStepRunCommand(staticRuns, 'pnpm build:ci')).toBe(true)
    expect(hasStepRunCommand(staticRuns, 'pnpm e2e:static --exclude e2e/taro-h5-build-smoke.test.ts --shard=${{ matrix.shard }}/${{ matrix.shard_total }}')).toBe(true)
    expect(hasStepRunCommand(focusedRuns, 'pnpm build:ci')).toBe(true)
    expect(hasStepRunCommand(multiplatformRuns, 'pnpm build:ci')).toBe(true)

    expect(workflow.jobs['e2e-focused'].strategy['fail-fast']).toBe(false)
    expect(matrixCaseNames(focusedRows)).toEqual([
      'generator-web-parity',
      'preprocessor-source',
      'framework-support',
      'taro-h5-build',
      'web-css-preservation',
      'demo-user-workflow',
    ])
    expect(focusedRows.map(row => row.command)).toEqual([
      'pnpm e2e:generator-parity',
      'pnpm e2e:preprocessor',
      'pnpm exec cross-env E2E_FRAMEWORK_SUPPORT=1 vitest run -c ./e2e/vitest.e2e.config.ts e2e/framework-ci-support.test.ts',
      'pnpm e2e:taro:h5-build',
      'pnpm e2e:web-css-preservation',
      'pnpm e2e:demo-user-workflow',
    ])
    expect(hasStepRunCommand(stepRuns(workflow, 'e2e-focused'), '${{ matrix.command }}')).toBe(true)

    expect(workflow.jobs['e2e-multiplatform'].strategy['fail-fast']).toBe(false)
    expect(matrixCaseNames(multiplatformRows)).toEqual([
      'build-output',
      'taro-alipay-output',
    ])
    expect(multiplatformRows.map(row => row.command)).toEqual([
      'pnpm e2e:multiplatform-build',
      'pnpm e2e:multiplatform-build:taro-alipay',
    ])
    expect(hasStepRunCommand(stepRuns(workflow, 'e2e-multiplatform'), '${{ matrix.command }}')).toBe(true)
  })

  it('keeps the preprocessor source demo in local e2e and CI', () => {
    const packageJson = readPackageJson<{ scripts: Record<string, string> }>('package.json')
    const { workflow } = readWorkflow('ci.yml')

    expect(packageJson.scripts['e2e:static']).toContain('E2E_SKIP_OPEN_AUTOMATOR=1')
    expect(packageJson.scripts['e2e:static:u']).toContain('E2E_SKIP_OPEN_AUTOMATOR=1')
    expect(packageJson.scripts['e2e:static:dev']).not.toContain('E2E_SKIP_OPEN_AUTOMATOR=1')
    for (const scriptName of ['e2e:static', 'e2e:static:u'] as const) {
      const script = packageJson.scripts[scriptName]
      expect(script).toContain('--exclude e2e/multiplatform-build-output.test.ts')
      expect(script).toContain('--exclude e2e/demo-user-workflow-output.test.ts')
      expect(script).toContain('--exclude e2e/preprocessor-source.test.ts')
      expect(script).toContain('--exclude e2e/framework-ci-support.test.ts')
      expect(script).toContain('--exclude e2e/framework-ide-support.test.ts')
      expect(script).toContain('--exclude e2e/hbuilderx-local.test.ts')
      expect(script).toContain('--exclude e2e/taro-web-demo-hmr.test.ts')
      expect(script).toContain('--exclude e2e/web-vite-demo-hmr.test.ts')
      expect(script).toContain('--exclude e2e/uni-app-vite-tailwindcss-dev-h5.test.ts')
    }
    expect(packageJson.scripts['e2e:preprocessor']).toBe('vitest run -c ./e2e/vitest.e2e.config.ts e2e/preprocessor-source.test.ts')
    expect(workflow.jobs['e2e-focused'].strategy.matrix.include).toEqual(expect.arrayContaining([
      expect.objectContaining({ command: 'pnpm e2e:preprocessor' }),
    ]))
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
    expect(compatibilityRuns).toContain('pnpm build:ci')
    expect(compatibilityRuns).toContain('test/bundlers/vite-plugin.uni-app-x.unit.test.ts')
    expect(compatibilityRuns).toContain('test/watch-hmr-coverage-matrix.unit.test.ts')
  })

  it('keeps a lightweight cross-platform e2e watch gate in CI', () => {
    const { workflow } = readWorkflow('ci.yml')
    const job = workflow.jobs['e2e-watch']
    const rows: Array<Record<string, unknown>> = job.strategy.matrix.include
    const runStep = job.steps.find((step: Record<string, unknown>) => {
      return step.name === 'Run e2e watch suite (CI cross-platform gate)'
    })

    expect(job.strategy['fail-fast']).toBe(false)
    expect(matrixCases(rows)).toEqual(expect.arrayContaining([
      'linux:22:uni-app-vite-tailwindcss-v3:default',
      'macos:22:uni-app-vite-tailwindcss-v3:default',
      'windows:22:uni-app-vite-tailwindcss-v3:default',
    ]))
    expect(rows.every(row => row.watch_web_only === '1')).toBe(true)
    expect(stepRuns(workflow, 'e2e-watch')).toContain('pnpm e2e:watch')
    expect(runStep.env.E2E_WATCH_WEB_ONLY).toBe("${{ matrix.watch_web_only || '0' }}")
    expect(runStep.env.E2E_WATCH_MAX_PLUGIN_PROCESS_MS).toBe("${{ matrix.watch_max_plugin_process_ms || '6000' }}")
    expect(job.steps.some((step: Record<string, unknown>) => {
      const withConfig = step.with as Record<string, unknown> | undefined
      return step.uses === 'actions/upload-artifact@v4'
        && typeof withConfig?.path === 'string'
        && withConfig.path.includes('e2e/benchmark/e2e-watch-hmr/hmr-speed-report.md')
    })).toBe(true)
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

  it('keeps release version phase lightweight inside changesets action', () => {
    const { workflow } = readWorkflow('release.yml')
    const releaseStep = workflow.jobs.release.steps.find((step: Record<string, unknown>) => {
      return step.id === 'changesets'
    })
    const publishScript = readText('scripts/publish-packages.mjs')
    const latestScript = publishScript.match(/function publishLatest\(options\) \{\n([\s\S]*?)\n\}/)?.[1] ?? ''
    const prereleaseScript = publishScript.match(/function publishPrerelease\(tag, options\) \{\n([\s\S]*?)\n\}/)?.[1] ?? ''
    const latestVersionBranch = latestScript.match(
      /if \(options\.phase === 'version'\) \{\n([\s\S]*?)\n  \}/,
    )?.[1] ?? ''
    const prereleaseVersionBranch = prereleaseScript.match(
      /if \(options\.phase === 'version'\) \{\n([\s\S]*?)\n    return\n  \}/,
    )?.[1] ?? ''

    expect(releaseStep.with.version).toBe('pnpm publish-packages -- --phase version')
    expect(latestVersionBranch).toContain('changeset\', \'version')
    expect(latestVersionBranch).not.toContain('pnpm\', [\'build')
    expect(latestVersionBranch).not.toContain('pnpm\', [\'test')
    expect(prereleaseVersionBranch).toContain('enterPreMode(tag, options)')
    expect(prereleaseVersionBranch).toContain('changeset\', \'version')
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
    expect(workflow.jobs['current-vs-published']['timeout-minutes']).toBe(45)
    expect(workflow.jobs['current-vs-published'].env.WEAPP_TW_BENCH_BASELINE).toContain('auto')
    expect(workflow.jobs['current-vs-published'].env.BENCH_BUILD_RUNS).toContain("github.event_name == 'pull_request' && '1'")
    expect(workflow.jobs['current-vs-published'].env.BENCH_HMR_RUNS).toContain("github.event_name == 'pull_request' && '1'")
    expect(workflow.jobs['current-vs-published'].env.BENCH_ONLY).toContain('demo-weapp-vite-tailwindcss-v3')
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
  })

  it('keeps local e2e:ide fail-fast and exposes focused case scripts', () => {
    const packageJson = readPackageJson<{ scripts: Record<string, string> }>('package.json')

    expect(packageJson.scripts['e2e:ide']).toContain('vitest run --bail=1')
    expect(packageJson.scripts['e2e:ide:skip-build']).toContain('vitest run --bail=1')
    expect(packageJson.scripts['e2e:ide:case']).toContain('E2E_IDE_PROBE_RETRIES=0')
    expect(packageJson.scripts['e2e:ide:case']).toContain('vitest run --bail=1')
    expect(packageJson.scripts['e2e:ide:case:skip-build']).toContain('E2E_IDE_BUILD=0')
    expect(packageJson.scripts['e2e:ide:case:skip-build']).toContain('E2E_IDE_PROBE_RETRIES=0')
    expect(packageJson.scripts['e2e:ide:issues-909-916-928']).toContain('e2e/issue-909-ide.test.ts')
    expect(packageJson.scripts['e2e:ide:issues-909-916-928']).toContain('vitest run --bail=1')
    expect(packageJson.scripts['e2e:ide:issues-909-916-928:skip-build']).toContain('E2E_SKIP_BUILD=1')
    expect(packageJson.scripts['e2e:ide:issue-909']).toBe('pnpm e2e:ide:issues-909-916-928')
    expect(packageJson.scripts['e2e:ide:issue-909:skip-build']).toBe('pnpm e2e:ide:issues-909-916-928:skip-build')
    expect(packageJson.scripts['e2e:ide:full']).toContain('pnpm e2e:ide:issues-909-916-928')
  })

  it('keeps e2e platform group scripts composable', () => {
    const packageJson = readPackageJson<{ scripts: Record<string, string> }>('package.json')
    const scripts = packageJson.scripts

    expect(scripts['e2e:mp']).toBe('pnpm e2e:static && pnpm e2e:hot-update:demo')
    expect(scripts['e2e:mp:ide']).toBe('pnpm e2e:ide:full')
    expect(scripts['e2e:h5']).toBe('pnpm e2e:taro:h5-build && pnpm e2e:taro:web-hmr && pnpm e2e:web:hmr')
    expect(scripts['e2e:app']).toBe('pnpm e2e:android && pnpm e2e:ios && pnpm e2e:harmony')

    expect(scripts['e2e:hbuilderx']).toBe('pnpm e2e:hbuilderx:local')
    expect(scripts['e2e:hbuilderx:mp']).toBe('pnpm e2e:hbuilderx:local:mp')
    expect(scripts['e2e:hbuilderx:h5']).toBe('pnpm e2e:hbuilderx:local:web')
    expect(scripts['e2e:hbuilderx:app']).toBe('pnpm e2e:hbuilderx:local:app')

    expect(scripts['e2e:android']).toBe('pnpm e2e:hbuilderx:android')
    expect(scripts['e2e:ios']).toBe('pnpm e2e:hbuilderx:ios')
    expect(scripts['e2e:harmony']).toBe('pnpm e2e:hbuilderx:harmony')
    expect(scripts['e2e:hbuilderx:android']).toBe('pnpm e2e:hbuilderx:local:android')
    expect(scripts['e2e:hbuilderx:ios']).toBe('pnpm e2e:hbuilderx:local:ios')
    expect(scripts['e2e:hbuilderx:harmony']).toBe('pnpm e2e:hbuilderx:local:harmony')

    expect(scripts['e2e:hbuilderx:local:demo']).toContain('E2E_HBUILDERX_LOCAL=1')
    expect(scripts['e2e:hbuilderx:local:demo']).toContain('E2E_HBUILDERX_CASE=uni-app-vite-vue3-hbuilderx-tailwindcss-v3,uni-app-vite-vue3-hbuilderx-tailwindcss-v4,uni-app-x-hbuilderx-tailwindcss-v3,uni-app-x-hbuilderx-tailwindcss-v4')
    expect(scripts['e2e:hbuilderx:local:demo:mp']).toContain('E2E_HBUILDERX_CASE_GROUP=mp')
    expect(scripts['e2e:hbuilderx:local:demo:mp-extra']).toBe('pnpm e2e:hbuilderx:local:demo:mp-alipay && pnpm e2e:hbuilderx:local:demo:mp-baidu && pnpm e2e:hbuilderx:local:demo:mp-toutiao')
    expect(scripts['e2e:hbuilderx:local:demo:mp-alipay']).toContain('E2E_HBUILDERX_MP_PLATFORM=mp-alipay')
    expect(scripts['e2e:hbuilderx:local:demo:mp-baidu']).toContain('E2E_HBUILDERX_MP_PLATFORM=mp-baidu')
    expect(scripts['e2e:hbuilderx:local:demo:mp-toutiao']).toContain('E2E_HBUILDERX_MP_PLATFORM=mp-toutiao')
    expect(scripts['e2e:hbuilderx:local:mp-alipay']).toContain('E2E_HBUILDERX_MP_PLATFORM=mp-alipay')
    expect(scripts['e2e:hbuilderx:local:mp-baidu']).toContain('E2E_HBUILDERX_MP_PLATFORM=mp-baidu')
    expect(scripts['e2e:hbuilderx:local:mp-toutiao']).toContain('E2E_HBUILDERX_MP_PLATFORM=mp-toutiao')
    expect(scripts['e2e:hbuilderx:local:demo:web']).toContain('E2E_HBUILDERX_CASE_GROUP=web')
    expect(scripts['e2e:hbuilderx:local:android']).toContain('E2E_HBUILDERX_APP_PLATFORM=app-android')
    expect(scripts['e2e:hbuilderx:local:ios']).toContain('E2E_HBUILDERX_APP_PLATFORM=app-ios')
    expect(scripts['e2e:hbuilderx:local:harmony']).toContain('E2E_HBUILDERX_APP_PLATFORM=app-harmony')
    expect(scripts['e2e:ci']).not.toContain('e2e:hbuilderx:local:demo')
    expect(scripts['e2e:ci']).not.toContain('e2e:hbuilderx:local:demo:mp-extra')
    expect(scripts['e2e:mp']).not.toContain('e2e:hbuilderx:local:demo')
    expect(scripts['e2e:h5']).not.toContain('e2e:hbuilderx:local:demo')
  })

  it('keeps demo dev scripts printing weapp-tailwindcss timing by default', () => {
    for (const { project, packageJson } of readDemoPackageJsons()) {
      const scripts = packageJson.scripts ?? {}
      const devScripts = Object.entries(scripts)
        .filter(([name]) => name.startsWith('dev') && name !== 'dev:e2e-watch')

      expect(devScripts.length, `${project} should expose dev scripts`).toBeGreaterThan(0)

      for (const [name, command] of devScripts) {
        expect(command, `${project} ${name} should enable timing output`).toContain('WEAPP_TW_HMR_TIMING=1')
      }
    }
  })

  it('keeps workspace demos using a fresh core build before dev and build scripts', () => {
    const ensureScript = readText('scripts/ensure-weapp-tailwindcss-built.mjs')

    expect(ensureScript).toContain('runtimeBuildTargets')
    expect(ensureScript).toContain('collectWorkspaceRuntimeDependencyNames')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/shared\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/logger\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/postcss-calc\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/reset\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/merge-v3\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/merge\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/cva\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/variants-v3\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/variants\'')

    for (const { project, packageJson } of readDemoPackageJsons()) {
      const dependencies = {
        ...(packageJson.dependencies ?? {}),
        ...(packageJson.devDependencies ?? {}),
      }
      if (!dependencies['weapp-tailwindcss']) {
        continue
      }

      const scripts = packageJson.scripts ?? {}
      for (const name of Object.keys(scripts)) {
        if (
          (name === 'dev' || name.startsWith('dev:') || name === 'build' || name.startsWith('build:'))
          && !name.endsWith(':e2e-watch')
        ) {
          expect(scripts[`pre${name}`], `${project} should refresh core dist before ${name}`)
            .toBe('node ../../scripts/ensure-weapp-tailwindcss-built.mjs')
        }
      }
    }
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

  it('keeps PR quick-gate watch smoke coverage on macOS and Windows', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const rows: Array<Record<string, unknown>> = workflow.jobs['pr-quick-gate'].strategy.matrix.include
    const cases = matrixCases(rows)

    expect(workflow.jobs['pr-quick-gate'].strategy['fail-fast']).toBe(false)
    expect(cases).toEqual(expect.arrayContaining([
      'macos:22:uni-app-vite-tailwindcss-v3:default',
      'macos:22:uni-app-vite-tailwindcss-v3:issue33',
      'macos:22:taro-webpack-react-tailwindcss-v3:default',
      'macos:22:taro-webpack-react-tailwindcss-v4:default',
      'macos:22:taro-vite-react-tailwindcss-v3:default',
      'macos:22:taro-vite-react-tailwindcss-v4:default',
      'macos:22:taro-webpack-vue3-tailwindcss-v3:default',
      'macos:22:taro-webpack-vue3-tailwindcss-v4:default',
      'macos:22:taro-vite-vue3-tailwindcss-v3:default',
      'macos:22:taro-vite-vue3-tailwindcss-v4:default',
      'macos:22:uni-app-vite-tailwindcss-v4:default',
      'macos:22:mpx-tailwindcss-v4:default',
      'windows:22:uni-app-vite-tailwindcss-v3:default',
      'windows:22:uni-app-vite-tailwindcss-v3:issue33',
      'windows:22:taro-webpack-react-tailwindcss-v4:default',
      'windows:22:mpx-tailwindcss-v4:default',
    ]))
    expect(cases.some(item => item.includes(':weapp-vite-tailwindcss-'))).toBe(false)
    expect(cases).not.toContain('macos:22:taro-webpack-react-tailwindcss-v4:issue33')
    expect(stepRuns(workflow, 'pr-quick-gate')).toContain('pnpm e2e:watch')
  })

  it('keeps nightly full-regression coverage for broad cases and Node 24 probes', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const rows: Array<Record<string, unknown>> = workflow.jobs['nightly-full-regression'].strategy.matrix.include

    expect(workflow.jobs['nightly-full-regression'].strategy['fail-fast']).toBe(false)
    expect(matrixCases(rows)).toEqual(expect.arrayContaining([
      'macos:22:demo-core:default',
      'macos:22:demo-taro-react:default',
      'macos:22:demo-taro-vue3:default',
      'macos:22:demo-uni:default',
      'macos:22:weapp-vite-tailwindcss-v4:issue33',
      'macos:22:taro-webpack-react-tailwindcss-v4:issue33',
      'macos:22:taro-vite-vue3-tailwindcss-v3:default',
      'macos:22:taro-vite-vue3-tailwindcss-v4:default',
      'windows:22:weapp-vite-tailwindcss-v4:issue33',
      'windows:22:taro-vite-vue3-tailwindcss-v4:default',
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
        watch_max_plugin_process_ms: '9000',
        watch_command_timeout_ms: '1500000',
      },
      {
        watch_case: 'uni-app-vite-tailwindcss-v3',
        round_profile: 'issue33',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_max_plugin_process_ms: '9000',
        watch_command_timeout_ms: '1500000',
      },
      {
        watch_case: 'taro-webpack-react-tailwindcss-v4',
        round_profile: 'default',
        timeout_minutes: 70,
        watch_timeout_ms: '600000',
        watch_max_hot_update_ms: '420000',
        watch_command_timeout_ms: '1800000',
        watch_web_only: '1',
      },
      {
        watch_case: 'mpx-tailwindcss-v4',
        round_profile: 'default',
        timeout_minutes: 35,
        watch_timeout_ms: '240000',
        watch_command_timeout_ms: '600000',
        watch_main_style_only: '1',
        watch_main_style_subpackage_limit: '0',
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
        watch_max_plugin_process_ms: '9000',
        watch_command_timeout_ms: '1500000',
      },
    ]
    const slowNightlyBudgets = [
      {
        os: 'macos-latest',
        runner_label: 'macos',
        watch_case: 'weapp-vite-tailwindcss-v4',
        round_profile: 'issue33',
        timeout_minutes: 40,
        watch_timeout_ms: '280000',
        watch_max_plugin_process_ms: '6000',
        watch_command_timeout_ms: '720000',
      },
      {
        os: 'macos-latest',
        runner_label: 'macos',
        watch_case: 'taro-webpack-react-tailwindcss-v4',
        round_profile: 'issue33',
        timeout_minutes: 70,
        watch_timeout_ms: '600000',
        watch_command_timeout_ms: '1800000',
      },
      {
        os: 'windows-latest',
        runner_label: 'windows',
        watch_case: 'weapp-vite-tailwindcss-v4',
        round_profile: 'issue33',
        timeout_minutes: 45,
        watch_timeout_ms: '320000',
        watch_max_plugin_process_ms: '6000',
        watch_command_timeout_ms: '840000',
      },
      {
        os: 'windows-latest',
        runner_label: 'windows',
        watch_case: 'taro-vite-vue3-tailwindcss-v4',
        round_profile: 'default',
        timeout_minutes: 70,
        watch_timeout_ms: '600000',
        watch_command_timeout_ms: '1800000',
      },
    ]
    const demoNightlyBudgets = [
      {
        watch_case: 'demo-core',
        timeout_minutes: 55,
        watch_command_timeout_ms: '2400000',
      },
      {
        watch_case: 'demo-taro-react',
        timeout_minutes: 70,
        watch_command_timeout_ms: '3300000',
      },
      {
        watch_case: 'demo-taro-vue3',
        timeout_minutes: 75,
        watch_command_timeout_ms: '3600000',
      },
      {
        watch_case: 'demo-uni',
        timeout_minutes: 45,
        watch_command_timeout_ms: '1800000',
      },
    ]

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
    const slowStartupTaroWebpackPrRows = prRows.filter(row => typeof row.watch_case === 'string' && row.watch_case.startsWith('taro-webpack-'))
    expect(slowStartupTaroWebpackPrRows).not.toHaveLength(0)
    for (const row of slowStartupTaroWebpackPrRows) {
      expect(row).toEqual(expect.objectContaining({
        watch_timeout_ms: '600000',
        watch_max_hot_update_ms: '420000',
        watch_command_timeout_ms: '1800000',
      }))
    }
    expect(nightlyRows).toContainEqual(expect.objectContaining(slowMacosWeappViteBudget))
    for (const budget of slowNightlyBudgets) {
      expect(nightlyRows).toContainEqual(expect.objectContaining(budget))
    }
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      ...slowMacosWeappViteBudget,
      'node-version': 24,
    }))
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      os: 'macos-latest',
      runner_label: 'macos',
      watch_case: 'uni-app-vite-tailwindcss-v3',
      round_profile: 'issue33',
      timeout_minutes: 60,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '9000',
      watch_command_timeout_ms: '1500000',
    }))
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      os: 'windows-latest',
      runner_label: 'windows',
      watch_case: 'uni-app-vite-tailwindcss-v3',
      round_profile: 'issue33',
      timeout_minutes: 60,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '9000',
      watch_command_timeout_ms: '1500000',
    }))
    for (const budget of demoNightlyBudgets) {
      expect(nightlyRows).toContainEqual(expect.objectContaining({
        os: 'macos-latest',
        runner_label: 'macos',
        round_profile: 'default',
        watch_timeout_ms: '420000',
        watch_max_plugin_process_ms: '60000',
        ...budget,
      }))
    }
    expect(nightlyRows.some(row => row.runner_label === 'macos' && row.watch_case === 'demo')).toBe(false)
    expect(nightlyRows.some(row => row.runner_label === 'windows' && row.watch_case === 'demo')).toBe(false)
    expect(nightlyRows.some(row => row.runner_label === 'windows' && row.watch_case === 'mpx-tailwindcss-v3')).toBe(false)
    expect(nightlyRows.some(row => row.watch_case === 'all')).toBe(false)
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

  it('keeps any explicit e2e watch plugin processing matrix budget within 60000ms', () => {
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
      expect(Number(budget), `${row.runner_label}:${row.watch_case}:${row.round_profile}`).toBeLessThanOrEqual(60000)
    }
  })

  it('keeps PR web-only watch rows away from the extra taro dev-entry smoke', () => {
    const source = fs.readFileSync(path.resolve(repoRoot, 'e2e/watch/taro-demo-dev.test.ts'), 'utf8')

    expect(source).toContain('E2E_WATCH_WEB_ONLY')
    expect(source).toContain('skips taro webpack pnpm dev smoke for web-only watch profile')
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
