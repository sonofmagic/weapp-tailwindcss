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

function listFiles(root: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'unpackage') {
      continue
    }
    const file = path.join(root, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFiles(file))
    }
    else {
      files.push(file)
    }
  }
  return files
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

function expectPlaywrightInstallRetry(run: string, command: string) {
  expect(run).toContain('for attempt in 1 2 3 4')
  expect(run).toContain(`if ${command}; then`)
  expect(run).toContain('sleep $((attempt * 10))')
  expect(run.trimEnd()).toContain(command)
}

function expectNoIdeOnlyRuntime(runText: string, label: string) {
  expect(runText, `${label} should not require HBuilderX`).not.toMatch(/hbuilderx|E2E_HBUILDERX/i)
  expect(runText, `${label} should not require WeChat DevTools or mini-program automator`).not.toMatch(/miniprogram-automator|weapp-ide|wechat-devtools|微信开发者工具/i)
  expect(runText, `${label} should not require IDE runtime`).not.toMatch(/E2E_IDE|e2e:ide/i)
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
    expectPlaywrightInstallRetry(
      qualityRuns.find(run => run.includes('playwright install chromium'))!,
      'pnpm exec playwright install chromium',
    )
    expect(hasStepRunCommand(qualityRuns, 'pnpm test')).toBe(true)
    expect(hasStepRunCommand(qualityRuns, 'pnpm test:release')).toBe(false)
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
    expect(staticRuns.join('\n')).toContain('pnpm exec playwright install chromium')
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
      'web-hmr',
      'uni-h5-dev-hmr',
      'demo-user-workflow',
      'demo-platform-output-matrix',
      'issues-977-978',
      'vite-web-hmr-unit',
      'watch-hmr-coverage-contract',
    ])
    expect(focusedRows.map(row => row.command)).toEqual([
      'pnpm e2e:generator-parity',
      'pnpm e2e:preprocessor',
      'pnpm exec cross-env E2E_FRAMEWORK_SUPPORT=1 vitest run -c ./e2e/vitest.e2e.config.ts e2e/framework-ci-support.test.ts',
      'pnpm e2e:taro:h5-build',
      'pnpm e2e:web-css-preservation',
      'pnpm e2e:web:hmr',
      'pnpm e2e:uni:h5-dev',
      'pnpm e2e:demo-user-workflow',
      'pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/e2e-matrix.test.ts',
      'pnpm e2e:issues-977-978',
      'pnpm --filter weapp-tailwindcss exec vitest run test/bundlers/vite-plugin.bundle.unit.test.ts -t "keeps the full web runtime" --coverage.enabled=false',
      'pnpm --filter weapp-tailwindcss exec vitest run test/watch-hmr-coverage-matrix.unit.test.ts --coverage.enabled=false',
    ])
    expectNoIdeOnlyRuntime(focusedRows.map(row => row.command).join('\n'), 'e2e-focused')
    expect(hasStepRunCommand(stepRuns(workflow, 'e2e-focused'), '${{ matrix.command }}')).toBe(true)
    expect(workflow.jobs['e2e-focused'].env).toMatchObject({
      E2E_UNI_H5_DEV_TIMEOUT_MS: '300000',
    })

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

    for (const jobName of ['e2e-static', 'e2e-focused', 'e2e-multiplatform'] as const) {
      const installRun = stepRuns(workflow, jobName).find(run => run.includes('playwright install chromium'))
      expect(installRun, `${jobName} should install Playwright Chromium`).toBeDefined()
      expectPlaywrightInstallRetry(installRun!, 'pnpm exec playwright install chromium')
    }
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
    expect(packageJson.scripts['e2e:demo-user-workflow']).toContain('e2e/demo-user-workflow-output.test.ts')
    expect(packageJson.scripts['e2e:demo-user-workflow']).toContain('e2e/demo-user-dev-workflow.test.ts')
    expect(packageJson.scripts['e2e:demo-user-workflow:dev']).toBe('cross-env E2E_WATCH_CASE=demo pnpm e2e:watch')
    const focusedRows: Array<Record<string, unknown>> = workflow.jobs['e2e-focused'].strategy.matrix.include
    expect(focusedRows).toEqual(expect.arrayContaining([
      expect.objectContaining({ command: 'pnpm e2e:preprocessor' }),
      expect.objectContaining({ command: 'pnpm e2e:demo-user-workflow' }),
    ]))
    expect(
      focusedRows.find(row => row.case_name === 'demo-user-workflow')?.command,
      'demo user workflow should run in CI focused gate without opening IDE runtimes',
    ).toBe('pnpm e2e:demo-user-workflow')
    expect(readText('e2e/preprocessor-source.test.ts')).toContain('@weapp-tailwindcss-demo/weapp-vite-tailwindcss-v4')
    expect(readText('demo/weapp-vite-tailwindcss-v4/app.css')).not.toContain('@import "tailwindcss";')
    expect(readText('demo/weapp-vite-tailwindcss-v4/tailwind.css')).toContain('@import "tailwindcss" source(none);')
  })

  it('keeps @tailwindcss-mangle/engine managed by the workspace catalog', () => {
    const workspace = YAML.parse(readText('pnpm-workspace.yaml')) as {
      catalogs?: Record<string, Record<string, string>>
      overrides?: Record<string, string>
    }
    const lockfile = YAML.parse(readText('pnpm-lock.yaml')) as {
      catalogs?: Record<string, Record<string, { specifier?: string, version?: string }>>
      importers?: Record<string, {
        dependencies?: Record<string, { specifier?: string, version?: string }>
      }>
    }
    const catalogVersion = workspace.catalogs?.tailwindcssMangleEngine?.['@tailwindcss-mangle/engine']
    const tailwindVersion = lockfile.catalogs?.tailwindcss4?.tailwindcss?.version

    expect(catalogVersion).toBeDefined()
    expect(tailwindVersion).toBeDefined()
    expect(workspace.overrides?.['@tailwindcss-mangle/engine']).toBeUndefined()
    expect(lockfile.catalogs?.tailwindcssMangleEngine?.['@tailwindcss-mangle/engine']).toEqual({
      specifier: catalogVersion,
      version: catalogVersion,
    })

    for (const importer of ['packages/postcss', 'packages/weapp-tailwindcss'] as const) {
      const packageJson = readPackageJson<{ dependencies?: Record<string, string> }>(`${importer}/package.json`)
      const dependency = lockfile.importers?.[importer]?.dependencies?.['@tailwindcss-mangle/engine']

      expect(packageJson.dependencies?.['@tailwindcss-mangle/engine'], importer)
        .toBe('catalog:tailwindcssMangleEngine')
      expect(dependency?.specifier, importer).toBe('catalog:tailwindcssMangleEngine')
      expect(dependency?.version, importer).toBe(`${catalogVersion}(tailwindcss@${tailwindVersion})`)
    }
  })

  it('keeps workflow_dispatch compatibility coverage across OS and Node versions', () => {
    const { source, workflow } = readWorkflow('ci.yml')
    const [workflowDispatchRows, pullRequestRows] = extractJsonArrays(source)

    expect(workflow.jobs.compatibility.strategy['fail-fast']).toBe(false)
    expect(matrixIds(workflowDispatchRows)).toEqual(expect.arrayContaining([
      'ubuntu-latest:22.12.0:node22-min-core',
      'ubuntu-latest:24:node24-core',
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
      'linux:22:uni-app-vite-tailwindcss-v4:default',
      'macos:22:uni-app-vite-tailwindcss-v4:default',
      'macos:22:uni-app-vite-tailwindcss-v4:mp-weixin:default',
      'windows:22:uni-app-vite-tailwindcss-v4:default',
    ]))
    expect(
      rows
        .filter(row => row.watch_case === 'uni-app-vite-tailwindcss-v4')
        .every(row => row.watch_web_only === '1'),
    ).toBe(true)
    expect(rows).toContainEqual(expect.objectContaining({
      runner_label: 'macos',
      watch_case: 'uni-app-vite-tailwindcss-v4:mp-weixin',
      artifact_case: 'uni-app-vite-tailwindcss-v4-mp-weixin',
      watch_max_plugin_process_ms: '9000',
    }))
    expect(stepRuns(workflow, 'e2e-watch')).toContain('pnpm e2e:watch')
    expectPlaywrightInstallRetry(
      stepRuns(workflow, 'e2e-watch').find(run => run.includes('playwright install chromium'))!,
      'pnpm --filter @weapp-tailwindcss/scripts exec playwright install chromium',
    )
    expect(runStep.env.E2E_WATCH_WEB_ONLY).toBe("${{ matrix.watch_web_only || '0' }}")
    expect(runStep.env.E2E_WATCH_MAX_PLUGIN_PROCESS_MS).toBe("${{ matrix.watch_max_plugin_process_ms || '6000' }}")
    const uploadSteps = job.steps.filter((step: Record<string, unknown>) => {
      return step.uses === 'actions/upload-artifact@v4'
    })
    expect(uploadSteps).toHaveLength(2)
    for (const step of uploadSteps) {
      const artifactName = String((step.with as Record<string, unknown>).name)
      expect(artifactName).toContain('${{ matrix.artifact_case || matrix.watch_case }}')
      expect(artifactName).not.toContain('${{ matrix.watch_case }}')
    }
    expect(job.steps.some((step: Record<string, unknown>) => {
      const withConfig = step.with as Record<string, unknown> | undefined
      return step.uses === 'actions/upload-artifact@v4'
        && typeof withConfig?.path === 'string'
        && withConfig.path.includes('e2e/benchmark/e2e-watch-hmr/hmr-speed-report.md')
    })).toBe(true)
  })

  it('keeps cssnano demos waiting for the local postcss-calc build', () => {
    const packageJson = readPackageJson<{
      devDependencies?: Record<string, string>
    }>('demo/style-injector-mpx/package.json')

    expect(packageJson.devDependencies?.['@weapp-tailwindcss/postcss-calc']).toBe('workspace:^')
  })

  it('keeps style injector enabled only in dedicated demo projects', () => {
    const demoRoot = path.join(repoRoot, 'demo')
    const demoProjects = fs.readdirSync(demoRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.tmp-'))
      .filter(entry => fs.existsSync(path.join(demoRoot, entry.name, 'package.json')))
      .map(entry => path.join(demoRoot, entry.name))
    const offenders = demoProjects.flatMap(projectRoot => listFiles(projectRoot))
      .filter(file => /\.(?:c?[jt]sx?|mjs|mts)$/.test(file))
      .filter((file) => {
        const project = path.relative(demoRoot, file).split(path.sep)[0]
        return !project.startsWith('style-injector')
      })
      .flatMap((file) => {
        const source = fs.readFileSync(file, 'utf8')
        return source
          .split(/\r?\n/)
          .filter(line => /\bstyleInjector\s*:/.test(line) && !/\bstyleInjector\s*:\s*false\b/.test(line))
          .map(() => path.relative(repoRoot, file))
      })

    expect(offenders).toEqual([])
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

  it('keeps PR benchmark coverage on the smoke demo matrix', () => {
    const { workflow } = readWorkflow('benchmark.yml')
    const job = workflow.jobs['current-vs-published']
    const runCommand = stepRuns(workflow, 'current-vs-published').find(run => run.includes('pnpm perf:guard'))

    expect(job['timeout-minutes']).toContain("github.event_name == 'pull_request' && 50")
    expect(job['timeout-minutes']).toContain('|| 90')
    expect(job.env.BENCH_ONLY).toContain('demo-weapp-vite-tailwindcss-v4__mp-weixin')
    expect(job.env.BENCH_ONLY).toContain('demo-taro-vite-react-tailwindcss-v4__mp-weixin')
    expect(job.env.BENCH_ONLY).toContain('demo-taro-webpack-react-tailwindcss-v4__mp-weixin')
    expect(job.env.BENCH_ONLY).toContain('demo-uni-app-vite-tailwindcss-v4__mp-weixin')
    expect(job.env.BENCH_ONLY).toContain('demo-mpx-tailwindcss-v4__mp-weixin')
    expect(job.env.BENCH_ONLY).toContain("github.event.inputs.only || ''")
    expect(job.env.BENCH_BUILD_RUNS).toContain("github.event_name == 'pull_request' && '3'")
    expect(job.env.BENCH_HMR_RUNS).toContain("github.event_name == 'pull_request' && '6'")
    expect(runCommand).toContain('--baseline-ref')
    expect(runCommand).toContain('--only "$BENCH_ONLY"')
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
    expect(publishScript).toContain('runWithRetry(\'pnpm\', [\'changeset\', \'version\']')
    expect(publishScript).toContain('/Premature close/i')
    expect(latestVersionBranch).toContain('runChangesetVersion(options)')
    expect(latestVersionBranch).not.toContain('pnpm\', [\'build')
    expect(latestVersionBranch).not.toContain('pnpm\', [\'test')
    expect(prereleaseVersionBranch).toContain('enterPreMode(tag, options)')
    expect(prereleaseVersionBranch).toContain('runChangesetVersion(options)')
  })

  it('runs base-ref performance guards on pull requests and published trends elsewhere', () => {
    const { workflow } = readWorkflow('benchmark.yml')
    const packageJson = readPackageJson<{ scripts: Record<string, string> }>('package.json')
    const runs = stepRuns(workflow, 'current-vs-published').join('\n')

    expect(packageJson.scripts['bench:ci']).toBe('node benchmark/version-compare/scripts/run-ci.mjs')
    expect(packageJson.scripts['perf:guard']).toBe('node benchmark/version-compare/scripts/run-ci.mjs --guard')
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
    expect(workflow.jobs['current-vs-published']['timeout-minutes']).toContain("github.event_name == 'pull_request' && 50")
    expect(workflow.jobs['current-vs-published']['timeout-minutes']).toContain('|| 90')
    expect(workflow.jobs['current-vs-published'].env.WEAPP_TW_BENCH_BASELINE).toContain('auto')
    expect(workflow.jobs['current-vs-published'].env.BENCH_BUILD_RUNS).toContain("github.event_name == 'pull_request' && '3'")
    expect(workflow.jobs['current-vs-published'].env.BENCH_HMR_RUNS).toContain("github.event_name == 'pull_request' && '6'")
    expect(workflow.jobs['current-vs-published'].env.BENCH_ONLY).toContain("github.event_name == 'pull_request'")
    expect(workflow.jobs['current-vs-published'].env.BENCH_ONLY).toContain("github.event.inputs.only || ''")
    expect(runs).toContain('pnpm install --frozen-lockfile')
    expect(runs).toContain('pnpm perf:guard --')
    expect(runs).toContain('--baseline-ref')
    expect(runs).toContain('pnpm bench:ci --')
    expect(runs).toContain('--result-dir .tmp/benchmark-ci/result')
    expect(workflow.jobs['current-vs-published'].steps.some((step: Record<string, unknown>) => {
      const withConfig = step.with as Record<string, unknown> | undefined
      return step.uses === 'actions/upload-artifact@v4'
        && withConfig?.name === 'benchmark-performance'
    })).toBe(true)
  })

  it('keeps published benchmark fixture resolver dependencies explicit', () => {
    const source = readText('benchmark/version-compare/scripts/run-ci.mjs')

    expect(source).toContain('publishedResolverDependencyNames')
    expect(source).toContain('pnpm\', [\'view\', normalizePackageSpec(baseline), \'dependencies\', \'--json\']')
    expect(source).toContain('patchPublishedResolverDependencies(json, resolverDependencies)')
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

    expect(scripts['e2e:app:hmr']).toBe('pnpm e2e:hbuilderx:app')
    expect(scripts['e2e:app:visual']).toContain('--app-only --fail-on-incomplete')
    expect(scripts['e2e:android']).toBe('pnpm e2e:android:hmr && pnpm e2e:android:visual')
    expect(scripts['e2e:android:hmr']).toBe('pnpm e2e:hbuilderx:android')
    expect(scripts['e2e:android:visual']).toContain('--android-only --fail-on-incomplete')
    expect(scripts['e2e:ios']).toBe('pnpm e2e:ios:hmr && pnpm e2e:ios:visual')
    expect(scripts['e2e:ios:hmr']).toBe('pnpm e2e:hbuilderx:ios')
    expect(scripts['e2e:ios:visual']).toContain('--ios-only --fail-on-incomplete')
    expect(scripts['e2e:harmony']).toBe('pnpm e2e:hbuilderx:harmony')
    expect(scripts['e2e:hbuilderx:android']).toBe('pnpm e2e:hbuilderx:local:android')
    expect(scripts['e2e:hbuilderx:ios']).toBe('pnpm e2e:hbuilderx:local:ios')
    expect(scripts['e2e:hbuilderx:harmony']).toBe('pnpm e2e:hbuilderx:local:harmony')

    expect(scripts['e2e:hbuilderx:local:demo']).toContain('E2E_HBUILDERX_LOCAL=1')
    expect(scripts['e2e:hbuilderx:local:demo']).toContain('E2E_HBUILDERX_CASE=uni-app-vite-vue3-hbuilderx-tailwindcss-v4,uni-app-x-hbuilderx-tailwindcss-v4')
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
    expect(ensureScript).toContain('\'@weapp-tailwindcss/debug-uni-app-x\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/merge\'')
    expect(ensureScript).toContain('\'@weapp-tailwindcss/cva\'')
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

  it('balances complete demo platform coverage across macOS, Linux, and Windows', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const rows: Array<Record<string, unknown>> = workflow.jobs['pr-quick-gate'].strategy.matrix.include
    const cases = matrixCases(rows)
    const demoShards = ['demo-core', 'demo-taro-react', 'demo-taro-vue3', 'demo-uni']
    const windowsSplitDemoCases = [
      'gulp-tailwindcss-v4',
      'weapp-vite-tailwindcss-v4',
      'mpx-tailwindcss-v4',
      'taro-vite-react-tailwindcss-v4',
      'taro-webpack-react-tailwindcss-v4',
      'taro-vite-vue3-tailwindcss-v4',
      'taro-webpack-vue3-tailwindcss-v4',
    ]
    const completeMiniProgramCases = [
      'taro-vite-react-tailwindcss-v4:alipay',
      'taro-vite-react-tailwindcss-v4:tt',
      'taro-vite-vue3-tailwindcss-v4:alipay',
      'taro-vite-vue3-tailwindcss-v4:tt',
      'uni-app-vite-tailwindcss-v4:mp-weixin',
      'uni-app-vite-tailwindcss-v4:mp-alipay',
      'uni-app-vite-tailwindcss-v4:mp-qq',
      'uni-app-vite-tailwindcss-v4:mp-toutiao',
    ]

    expect(workflow.jobs['pr-quick-gate'].strategy['fail-fast']).toBe(false)
    for (const watchCase of demoShards) {
      expect(cases, `linux should cover ${watchCase}`).toContain(`linux:22:${watchCase}:default`)
    }
    for (const watchCase of demoShards.filter(item => item !== 'demo-core')) {
      expect(cases, `macos should cover ${watchCase}`).toContain(`macos:22:${watchCase}:default`)
    }
    expect(cases).toContain('macos:22:demo-core:main-style')
    expect(cases).toContain('windows:22:demo-uni:default')
    for (const watchCase of windowsSplitDemoCases) {
      const profile = watchCase === 'mpx-tailwindcss-v4' || watchCase.startsWith('taro-')
        ? 'main-style'
        : 'default'
      expect(cases, `windows should split ${watchCase}`).toContain(`windows:22:${watchCase}:${profile}`)
    }
    for (const runner of ['linux', 'windows']) {
      for (const watchCase of completeMiniProgramCases) {
        const profile = runner === 'windows' && (watchCase.endsWith(':alipay') || watchCase.endsWith(':tt'))
          ? 'main-style'
          : 'default'
        expect(cases, `${runner} should cover ${watchCase}`).toContain(`${runner}:22:${watchCase}:${profile}`)
      }
    }
    const macosPlatformCases = rows
      .filter(row => row.runner_label === 'macos' && String(row.watch_case).includes(':'))
      .map(row => row.watch_case)
    expect(macosPlatformCases).toEqual(['uni-app-vite-tailwindcss-v4:mp-weixin'])
    expect(rows.filter(row => row.runner_label === 'macos')).toHaveLength(9)
    expect(rows.filter(row => row.runner_label === 'linux')).toHaveLength(12)
    expect(rows.filter(row => row.runner_label === 'windows')).toHaveLength(21)
    for (const row of [
      rows.find(row => row.runner_label === 'macos' && row.watch_case === 'demo-core'),
      rows.find(row => row.runner_label === 'windows' && row.watch_case === 'mpx-tailwindcss-v4'),
      rows.find(row => row.runner_label === 'windows' && row.watch_case === 'taro-vite-react-tailwindcss-v4:alipay'),
      rows.find(row => row.runner_label === 'windows' && row.watch_case === 'taro-vite-vue3-tailwindcss-v4:alipay'),
    ]) {
      expect(row).toMatchObject({
        round_profile: 'main-style',
        watch_main_style_only: '1',
        watch_main_style_subpackage_limit: '0',
        watch_max_attempts: '1',
        timeout_minutes: 35,
        watch_command_timeout_ms: '1500000',
      })
    }
    expect(cases.filter(item => item.includes(':weapp-vite-tailwindcss-'))).toEqual([
      'windows:22:weapp-vite-tailwindcss-v4:default',
    ])
    expect(cases).not.toContain('macos:22:taro-webpack-react-tailwindcss-v4:issue33')
    expect(rows.some(row => String(row.watch_case).includes('hbuilderx') || String(row.watch_case).includes('uni-app-x'))).toBe(false)
    expect(workflow.jobs['root-style-import-shell-hmr']['runs-on']).toBe('ubuntu-latest')
    expect(workflow.jobs['uni-app-css-post-hmr']['runs-on']).toBe('windows-latest')
    expectNoIdeOnlyRuntime(stepRuns(workflow, 'pr-quick-gate').join('\n'), 'e2e-watch pr quick gate')
    expect(stepRuns(workflow, 'pr-quick-gate')).toContain('pnpm e2e:watch')
    const watchStep = workflow.jobs['pr-quick-gate'].steps.find((step: Record<string, unknown>) => step.run === 'pnpm e2e:watch')
    expect(watchStep?.env).toMatchObject({
      E2E_TARO_DEV_READY_TIMEOUT_MS: '${{ matrix.taro_dev_ready_timeout_ms || matrix.watch_timeout_ms }}',
      E2E_WATCH_MAIN_STYLE_ONLY: "${{ matrix.watch_main_style_only || '0' }}",
      E2E_WATCH_MAIN_STYLE_SUBPACKAGE_LIMIT: "${{ matrix.watch_main_style_subpackage_limit || '' }}",
    })
    expectPlaywrightInstallRetry(
      stepRuns(workflow, 'pr-quick-gate').find(run => run.includes('playwright install chromium'))!,
      'pnpm --filter @weapp-tailwindcss/scripts exec playwright install chromium',
    )
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
      'macos:22:taro-vite-vue3-tailwindcss-v4:default',
      'macos:22:taro-vite-vue3-tailwindcss-v4:default',
      'windows:22:weapp-vite-tailwindcss-v4:issue33',
      'windows:22:taro-vite-vue3-tailwindcss-v4:default',
      'macos:24:weapp-vite-tailwindcss-v4:issue33',
      'windows:24:weapp-vite-tailwindcss-v4:issue33',
    ]))
    expect(stepRuns(workflow, 'nightly-full-regression')).toContain('pnpm e2e:watch')
    expectPlaywrightInstallRetry(
      stepRuns(workflow, 'nightly-full-regression').find(run => run.includes('playwright install chromium'))!,
      'pnpm --filter @weapp-tailwindcss/scripts exec playwright install chromium',
    )
  })

  it('runs the uni-app scoped CSS post regression in PR watch CI', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const runs = stepRuns(workflow, 'uni-app-css-post-hmr')

    expect(workflow.jobs['uni-app-css-post-hmr']['runs-on']).toBe('windows-latest')
    expect(runs).toContain('pnpm e2e:uni-app-css-post-hmr')
    expect(runs).toContain('pnpm --filter weapp-tailwindcss... --filter "./packages-runtime/*" run build')
    expectNoIdeOnlyRuntime(runs.join('\n'), 'uni-app scoped CSS post HMR')
  })

  it('keeps explicit plugin processing budgets for e2e watch rows while allowing longer startup timeouts', () => {
    const { workflow } = readWorkflow('e2e-watch.yml')
    const prRows: Array<Record<string, unknown>> = workflow.jobs['pr-quick-gate'].strategy.matrix.include
    const nightlyRows: Array<Record<string, unknown>> = workflow.jobs['nightly-full-regression'].strategy.matrix.include

    const slowMacosWeappViteBudget = {
      os: 'macos-latest',
      runner_label: 'macos',
      watch_case: 'weapp-vite-tailwindcss-v4',
      round_profile: 'issue33',
      timeout_minutes: 60,
      watch_timeout_ms: '600000',
      watch_max_plugin_process_ms: '6000',
      watch_command_timeout_ms: '1500000',
    }
    const slowWindowsPrBudgets = [
      {
        watch_case: 'uni-app-vite-tailwindcss-v4',
        round_profile: 'issue33',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_max_plugin_process_ms: '9000',
        watch_command_timeout_ms: '1500000',
      },
    ]
    const slowMacosUniAppPrBudgets = [
      {
        watch_case: 'uni-app-vite-tailwindcss-v4',
        round_profile: 'default',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_command_timeout_ms: '1500000',
      },
      {
        watch_case: 'uni-app-vite-tailwindcss-v4',
        round_profile: 'issue33',
        timeout_minutes: 60,
        watch_timeout_ms: '420000',
        watch_max_plugin_process_ms: '9000',
        watch_command_timeout_ms: '1500000',
      },
    ]
    const slowDemoTaroPrBudgets = [
      'demo-taro-react',
      'demo-taro-vue3',
    ].map(watchCase => ({
      watch_case: watchCase,
      round_profile: 'default',
      timeout_minutes: 90,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '60000',
      watch_command_timeout_ms: '4800000',
    }))
    const slowLinuxDemoCorePrBudget = {
      watch_case: 'demo-core',
      round_profile: 'default',
      timeout_minutes: 95,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '60000',
      watch_command_timeout_ms: '5100000',
    }
    const minimalMacosDemoCorePrBudget = {
      watch_case: 'demo-core',
      round_profile: 'main-style',
      watch_main_style_only: '1',
      watch_main_style_subpackage_limit: '0',
      watch_max_attempts: '1',
      timeout_minutes: 35,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '60000',
      watch_command_timeout_ms: '1500000',
    }
    const minimalWindowsMpxPrBudget = {
      watch_case: 'mpx-tailwindcss-v4',
      round_profile: 'main-style',
      watch_main_style_only: '1',
      watch_main_style_subpackage_limit: '0',
      watch_max_attempts: '1',
      timeout_minutes: 35,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '60000',
      watch_command_timeout_ms: '1500000',
    }
    const slowLinuxTaroTtPrBudgets = [
      'taro-vite-react-tailwindcss-v4:tt',
      'taro-vite-vue3-tailwindcss-v4:tt',
    ].map(watchCase => ({
      watch_case: watchCase,
      round_profile: 'default',
      timeout_minutes: 70,
      watch_timeout_ms: '600000',
      watch_max_plugin_process_ms: '10000',
      watch_command_timeout_ms: '3300000',
    }))
    const minimalWindowsTaroTtPrBudgets = [
      'taro-vite-react-tailwindcss-v4:tt',
      'taro-vite-vue3-tailwindcss-v4:tt',
    ].map(watchCase => ({
      watch_case: watchCase,
      round_profile: 'main-style',
      watch_main_style_only: '1',
      watch_main_style_subpackage_limit: '2',
      watch_max_attempts: '1',
      timeout_minutes: 45,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '18000',
      watch_command_timeout_ms: '2400000',
    }))
    const slowLinuxTaroAlipayPrBudgets = [
      { watchCase: 'taro-vite-react-tailwindcss-v4:alipay', pluginBudget: '10000' },
      { watchCase: 'taro-vite-vue3-tailwindcss-v4:alipay', pluginBudget: '9000' },
    ].map(({ watchCase, pluginBudget }) => ({
      watch_case: watchCase,
      round_profile: 'default',
      timeout_minutes: 55,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: pluginBudget,
      watch_command_timeout_ms: '2700000',
    }))
    const defaultWindowsSplitDemoPrBudgets = [
      'gulp-tailwindcss-v4',
      'weapp-vite-tailwindcss-v4',
    ].map(watchCase => ({
      watch_case: watchCase,
      round_profile: 'default',
      timeout_minutes: 60,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '60000',
      watch_command_timeout_ms: '3000000',
    }))
    const minimalWindowsTaroVuePrBudget = {
      watch_case: 'taro-vite-vue3-tailwindcss-v4',
      round_profile: 'main-style',
      watch_main_style_only: '1',
      watch_main_style_subpackage_limit: '2',
      watch_max_attempts: '1',
      timeout_minutes: 45,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '18000',
      watch_command_timeout_ms: '2400000',
    }
    const windowsTaroVueWebPrBudget = {
      watch_case: 'taro-vite-vue3-tailwindcss-v4',
      round_profile: 'web-only',
      watch_web_only: '1',
      watch_max_attempts: '1',
      timeout_minutes: 25,
      watch_timeout_ms: '420000',
      watch_command_timeout_ms: '1200000',
    }
    const minimalWindowsTaroPrBudgets = [
      { watchCase: 'taro-vite-react-tailwindcss-v4', timeoutMs: '420000' },
      { watchCase: 'taro-webpack-react-tailwindcss-v4', timeoutMs: '420000', taroReadyTimeoutMs: '900000' },
      { watchCase: 'taro-webpack-vue3-tailwindcss-v4', timeoutMs: '600000', taroReadyTimeoutMs: '900000' },
    ].map(({ watchCase, timeoutMs, taroReadyTimeoutMs }) => ({
      watch_case: watchCase,
      round_profile: 'main-style',
      watch_main_style_only: '1',
      watch_main_style_subpackage_limit: '2',
      watch_max_attempts: '1',
      timeout_minutes: 45,
      watch_timeout_ms: timeoutMs,
      watch_max_plugin_process_ms: '18000',
      ...(taroReadyTimeoutMs == null ? {} : { taro_dev_ready_timeout_ms: taroReadyTimeoutMs }),
      watch_command_timeout_ms: '2400000',
    }))
    const windowsTaroWebPrBudgets = [
      { watchCase: 'taro-vite-react-tailwindcss-v4', timeoutMs: '420000' },
      { watchCase: 'taro-webpack-react-tailwindcss-v4', timeoutMs: '600000' },
      { watchCase: 'taro-webpack-vue3-tailwindcss-v4', timeoutMs: '600000' },
    ].map(({ watchCase, timeoutMs }) => ({
      watch_case: watchCase,
      round_profile: 'web-only',
      watch_web_only: '1',
      watch_max_attempts: '1',
      timeout_minutes: 25,
      watch_timeout_ms: timeoutMs,
      watch_command_timeout_ms: '1200000',
    }))
    const slowWindowsTaroAlipayPrBudgets = [
      'taro-vite-react-tailwindcss-v4:alipay',
      'taro-vite-vue3-tailwindcss-v4:alipay',
    ].map(watchCase => ({
      watch_case: watchCase,
      round_profile: 'main-style',
      watch_main_style_only: '1',
      watch_main_style_subpackage_limit: '0',
      watch_max_attempts: '1',
      timeout_minutes: 35,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '18000',
      watch_command_timeout_ms: '1500000',
    }))
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
    expect(prRows).toContainEqual(expect.objectContaining({
      os: 'macos-latest',
      runner_label: 'macos',
      ...minimalMacosDemoCorePrBudget,
    }))
    expect(prRows).toContainEqual(expect.objectContaining({
      os: 'ubuntu-latest',
      runner_label: 'linux',
      ...slowLinuxDemoCorePrBudget,
    }))
    expect(prRows).toContainEqual(expect.objectContaining({
      os: 'windows-latest',
      runner_label: 'windows',
      ...minimalWindowsMpxPrBudget,
    }))
    for (const runner of [
      { os: 'macos-latest', runner_label: 'macos' },
      { os: 'ubuntu-latest', runner_label: 'linux' },
    ]) {
      for (const budget of slowDemoTaroPrBudgets) {
        expect(prRows).toContainEqual(expect.objectContaining({
          ...runner,
          ...budget,
        }))
      }
    }
    for (const budget of defaultWindowsSplitDemoPrBudgets) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'windows-latest',
        runner_label: 'windows',
        ...budget,
      }))
    }
    for (const budget of [minimalWindowsTaroVuePrBudget, windowsTaroVueWebPrBudget]) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'windows-latest',
        runner_label: 'windows',
        ...budget,
      }))
    }
    for (const budget of [...minimalWindowsTaroPrBudgets, ...windowsTaroWebPrBudgets]) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'windows-latest',
        runner_label: 'windows',
        ...budget,
      }))
    }
    for (const budget of slowLinuxTaroTtPrBudgets) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'ubuntu-latest',
        runner_label: 'linux',
        ...budget,
      }))
    }
    for (const budget of minimalWindowsTaroTtPrBudgets) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'windows-latest',
        runner_label: 'windows',
        ...budget,
      }))
    }
    for (const budget of slowLinuxTaroAlipayPrBudgets) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'ubuntu-latest',
        runner_label: 'linux',
        ...budget,
      }))
    }
    for (const budget of slowWindowsTaroAlipayPrBudgets) {
      expect(prRows).toContainEqual(expect.objectContaining({
        os: 'windows-latest',
        runner_label: 'windows',
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
      watch_case: 'uni-app-vite-tailwindcss-v4',
      round_profile: 'issue33',
      timeout_minutes: 60,
      watch_timeout_ms: '420000',
      watch_max_plugin_process_ms: '9000',
      watch_command_timeout_ms: '1500000',
    }))
    expect(nightlyRows).toContainEqual(expect.objectContaining({
      os: 'windows-latest',
      runner_label: 'windows',
      watch_case: 'uni-app-vite-tailwindcss-v4',
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
    expect(nightlyRows.some(row => row.runner_label === 'windows' && row.watch_case === 'mpx-tailwindcss-v4')).toBe(false)
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

  it('keeps reduced PR watch rows away from the extra taro dev-entry smoke', () => {
    const source = fs.readFileSync(path.resolve(repoRoot, 'e2e/watch/taro-demo-dev.test.ts'), 'utf8')

    expect(source).toContain('E2E_WATCH_WEB_ONLY')
    expect(source).toContain('E2E_WATCH_MAIN_STYLE_ONLY')
    expect(source).toContain('skips taro pnpm dev smoke for reduced watch profile')
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
