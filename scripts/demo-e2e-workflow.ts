import { spawn } from 'node:child_process'
import process from 'node:process'

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
  const child = spawn(step.command, step.args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...step.env,
    },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  const exitCode = await new Promise<number>((resolve, reject) => {
    child.on('error', reject)
    child.on('close', code => resolve(code ?? 1))
  })

  if (exitCode !== 0) {
    throw new Error(`[demo-e2e] ${step.name} failed with exit=${exitCode}`)
  }
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
      args: ['e2e:ide'],
    },
    {
      name: 'demo mini-program watch hot-update',
      command: 'pnpm',
      args: ['e2e:hot-update:demo'],
    },
    {
      name: 'Taro H5 browser HMR',
      command: 'pnpm',
      args: ['e2e:taro:web-hmr'],
    },
    {
      name: 'web Vite browser HMR',
      command: 'pnpm',
      args: ['e2e:web:hmr'],
    },
  ]

  if (includeLocal) {
    steps.push(
      {
        name: 'HBuilderX uni-app/uni-app x mp-weixin',
        command: 'pnpm',
        args: ['e2e:hbuilderx:local:mp'],
        local: true,
      },
      {
        name: 'HBuilderX uni-app Web HMR',
        command: 'pnpm',
        args: ['e2e:hbuilderx:local:web'],
        local: true,
      },
      {
        name: 'HBuilderX uni-app/uni-app x Android HMR',
        command: 'pnpm',
        args: ['e2e:hbuilderx:local:android'],
        local: true,
      },
      {
        name: 'HBuilderX uni-app/uni-app x iOS HMR',
        command: 'pnpm',
        args: ['e2e:hbuilderx:local:ios'],
        local: true,
      },
    )
  }
  else {
    process.stdout.write('[demo-e2e] skip local HBuilderX Android/iOS stages; pass --local to include them.\n')
  }

  return steps
}

async function main() {
  const steps = createWorkflowSteps(hasFlag('--local'))
  for (const [index, step] of steps.entries()) {
    await runStep(step, index + 1, steps.length)
  }
  process.stdout.write('[demo-e2e] workflow passed\n')
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
