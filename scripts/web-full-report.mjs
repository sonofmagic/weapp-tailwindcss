import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { projects } from './web-full-report/constants.mjs'
import { runHmr } from './web-full-report/hmr.mjs'
import { writeMarkdown } from './web-full-report/markdown.mjs'
import {
  collectArtifacts,
  createPaths,
  helpText,
  parseArgs,
  rel,
  runCapture,
  runCommandRecord,
} from './web-full-report/utils.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(helpText())
    return
  }

  const paths = createPaths(repoRoot, args.output)
  const context = {
    repoRoot,
    ...paths,
    timeoutMs: Number(process.env.E2E_WEB_VITE_HMR_TIMEOUT_MS ?? 120_000),
  }
  await fs.mkdir(context.logsDir, { recursive: true })

  const gitStatusBefore = runCapture('git', ['status', '--short', '--branch'], { repoRoot }).stdout
  const gitHead = runCapture('git', ['rev-parse', 'HEAD'], { repoRoot }).stdout.trim()
  const nodeVersion = runCapture('node', ['-v'], { repoRoot }).stdout.trim()
  const pnpmVersion = runCapture('pnpm', ['-v'], { repoRoot }).stdout.trim()
  const commands = []

  console.log(`[report] ${rel(repoRoot, context.reportRoot)}`)
  commands.push(await runCommandRecord(context, 'build-weapp-tailwindcss', 'pnpm', ['--filter', 'weapp-tailwindcss', 'build']))

  const projectReports = []
  for (const project of projects) {
    console.log(`[build] ${project}`)
    const cwd = path.join(repoRoot, 'demo', 'web', project)
    const packageName = `@weapp-tailwindcss-demo/web-${project}`
    const webBuild = await runCommandRecord(context, `${project}-build-web`, 'pnpm', ['--filter', packageName, 'build:web'])
    const weappBuild = await runCommandRecord(context, `${project}-build-weapp`, 'pnpm', ['--filter', packageName, 'build:weapp'])
    commands.push(webBuild, weappBuild)
    projectReports.push({
      name: project,
      cwd: rel(repoRoot, cwd),
      packageName,
      builds: {
        web: webBuild,
        weapp: weappBuild,
      },
      artifacts: {
        web: await collectArtifacts(repoRoot, project, 'web'),
        weapp: await collectArtifacts(repoRoot, project, 'weapp'),
      },
    })
  }

  console.log('[compare] demo:web:compare')
  const compareCommand = await runCommandRecord(context, 'demo-web-compare', 'pnpm', ['demo:web:compare'], {
    env: {
      WEB_DEMO_COMPARE_OUTPUT: context.compareOutput,
    },
  })
  commands.push(compareCommand)
  const compareRawFile = path.join(context.compareOutput, 'report.json')
  const compareRaw = JSON.parse(await fs.readFile(compareRawFile, 'utf8'))
  const compareProjects = Object.fromEntries(compareRaw.map((item) => {
    const screenshots = item.screenshots
      ? Object.fromEntries(Object.entries(item.screenshots).map(([key, value]) => [
          key,
          path.isAbsolute(value) ? rel(repoRoot, value) : value,
        ]))
      : undefined
    return [item.project, {
      ...item,
      ...(screenshots ? { screenshots } : {}),
    }]
  }))

  const statusBeforeHmr = runCapture('git', ['status', '--short'], { repoRoot }).stdout
  console.log('[hmr] start')
  const hmr = await runHmr(context)
  const statusAfterHmr = runCapture('git', ['status', '--short'], { repoRoot }).stdout
  if (statusBeforeHmr !== statusAfterHmr) {
    throw new Error(`HMR 前后 git status 不一致\nbefore:\n${statusBeforeHmr}\nafter:\n${statusAfterHmr}`)
  }

  const gitStatusAfter = runCapture('git', ['status', '--short', '--branch'], { repoRoot }).stdout
  const report = {
    generatedAt: new Date().toISOString(),
    repositoryRoot: repoRoot,
    reportRoot: rel(repoRoot, context.reportRoot),
    environment: {
      gitHead,
      gitStatusBefore,
      gitStatusAfter,
      nodeVersion,
      pnpmVersion,
      submoduleStatusNote: 'Pre-existing submodule changes are not included in validation conclusions.',
    },
    commands,
    projects: projectReports,
    compare: {
      outputDir: rel(repoRoot, context.compareOutput),
      reportFile: rel(repoRoot, compareRawFile),
      projects: compareProjects,
    },
    hmr,
  }
  await fs.writeFile(context.reportJsonFile, JSON.stringify(report, null, 2))
  await writeMarkdown(context, report)
  console.log(JSON.stringify({
    reportRoot: rel(repoRoot, context.reportRoot),
    readme: rel(repoRoot, context.readmeFile),
    json: rel(repoRoot, context.reportJsonFile),
    hmr: rel(repoRoot, context.hmrOutFile),
  }, null, 2))

  const failedCommand = commands.find(item => item.exitCode !== 0)
  const failedHmr = hmr.cases.find(item => item.status !== 'passed')
  const failedCss = projectReports.find(item => item.artifacts.weapp.cssChecks?.failedCount > 0)
  const failedParity = Object.values(compareProjects).find(item => item.parity?.failedCount > 0)
  if (failedCommand || failedHmr || failedCss || failedParity) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
