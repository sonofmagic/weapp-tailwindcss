import type { DemoE2eMemorySample, DemoE2eMemoryStepReport } from './demo-e2e-memory'
import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import {
  createDemoE2eMemoryReport,

  sampleProcessTree,
  summarizeMemorySamples,
  writeDemoE2eMemoryReport,
} from './demo-e2e-memory'

interface WorkflowStep {
  name: string
  command: string
  args: string[]
  env?: Record<string, string>
  local?: boolean
}

function hasFlag(name: string) {
  return process.argv.slice(2).includes(name)
}

function formatStep(step: WorkflowStep, index: number, total: number) {
  const local = step.local ? ' local' : ''
  return `[demo-e2e] ${index}/${total}${local} ${step.name}: ${step.command} ${step.args.join(' ')}\n`
}

async function runStep(step: WorkflowStep, index: number, total: number) {
  process.stdout.write(formatStep(step, index, total))
  const startedAt = Date.now()
  const samples: DemoE2eMemorySample[] = []
  const child = spawn(step.command, step.args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...step.env,
    },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  const record = () => {
    const sample = sampleProcessTree(child.pid)
    if (sample) {
      samples.push(sample)
    }
  }
  const timer = setInterval(record, 1000)
  timer.unref?.()
  record()

  let spawnError: unknown
  const exitCode = await new Promise<number>((resolve) => {
    let settled = false
    child.on('error', (error) => {
      spawnError = error
      if (!settled) {
        settled = true
        resolve(1)
      }
    })
    child.on('close', (code) => {
      if (!settled) {
        settled = true
        resolve(code ?? 1)
      }
    })
  })
  clearInterval(timer)
  record()

  const report: DemoE2eMemoryStepReport = {
    name: step.name,
    command: [step.command, ...step.args],
    exitCode,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date().toISOString(),
    local: step.local === true,
    summary: summarizeMemorySamples(samples),
    samples,
  }

  process.stdout.write(
    `[demo-e2e] ${step.name} memory: peakRSS=${report.summary.peakRssMb}MB rssDelta=${report.summary.rssDeltaMb}MB samples=${report.summary.count}\n`,
  )

  if (exitCode !== 0) {
    const reason = spawnError instanceof Error ? `: ${spawnError.message}` : ''
    const error = new Error(`[demo-e2e] ${step.name} failed with exit=${exitCode}${reason}`)
    Object.assign(error, { stepReport: report })
    throw error
  }

  return report
}

function createWorkflowSteps(includeLocal: boolean): WorkflowStep[] {
  const steps: WorkflowStep[] = [
    {
      name: 'matrix assertions',
      command: 'pnpm',
      args: ['exec', 'vitest', 'run', '-c', './e2e/vitest.e2e.config.ts', 'e2e/e2e-matrix.test.ts'],
    },
    {
      name: 'WeChat DevTools IDE + visible hot update',
      command: 'pnpm',
      args: ['e2e:mp:ide'],
    },
    {
      name: 'demo mini-program watch hot-update',
      command: 'pnpm',
      args: ['e2e:mp'],
    },
    {
      name: 'H5 browser build and HMR',
      command: 'pnpm',
      args: ['e2e:h5'],
    },
  ]

  if (includeLocal) {
    steps.push(
      {
        name: 'HBuilderX uni-app/uni-app x mp-weixin',
        command: 'pnpm',
        args: ['e2e:hbuilderx:mp'],
        local: true,
      },
      {
        name: 'HBuilderX uni-app H5 HMR',
        command: 'pnpm',
        args: ['e2e:hbuilderx:h5'],
        local: true,
      },
      {
        name: 'HBuilderX uni-app/uni-app x Android HMR',
        command: 'pnpm',
        args: ['e2e:android'],
        local: true,
      },
      {
        name: 'HBuilderX uni-app/uni-app x iOS HMR',
        command: 'pnpm',
        args: ['e2e:ios'],
        local: true,
      },
      {
        name: 'HBuilderX uni-app x Harmony HMR',
        command: 'pnpm',
        args: ['e2e:harmony'],
        local: true,
      },
    )
  }
  else {
    process.stdout.write('[demo-e2e] skip local HBuilderX mp/H5/Android/iOS/Harmony stages; pass --local to include them.\n')
  }

  return steps
}

async function main() {
  const includeLocal = hasFlag('--local')
  const steps = createWorkflowSteps(includeLocal)
  const stepReports: DemoE2eMemoryStepReport[] = []
  let exitCode = 0
  const writeReport = async () => {
    const report = createDemoE2eMemoryReport({
      repositoryRoot: process.cwd(),
      includeLocal,
      exitCode,
      steps: stepReports,
    })
    const result = await writeDemoE2eMemoryReport({ report })
    process.stdout.write(`[demo-e2e] memory report: ${path.relative(process.cwd(), result.markdownFile)}\n`)
  }
  for (const [index, step] of steps.entries()) {
    try {
      stepReports.push(await runStep(step, index + 1, steps.length))
      await writeReport()
    }
    catch (error) {
      const stepReport = (error as { stepReport?: DemoE2eMemoryStepReport }).stepReport
      if (stepReport) {
        stepReports.push(stepReport)
      }
      exitCode = 1
      await writeReport()
      throw error
    }
  }
  process.stdout.write('[demo-e2e] workflow passed\n')
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
