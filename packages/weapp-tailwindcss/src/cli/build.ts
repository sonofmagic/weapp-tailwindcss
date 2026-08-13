import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)

type CssTarget = 'web' | 'weapp'

interface TargetArgs {
  argv: string[]
  target: CssTarget
}

function parseTarget(argv: string[]): TargetArgs {
  const forwarded: string[] = []
  let target: CssTarget = 'web'
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--target') {
      const value = argv[++index]
      if (value !== 'web' && value !== 'weapp') {
        throw new Error('Option "--target" must be "web" or "weapp".')
      }
      target = value
      continue
    }
    if (arg?.startsWith('--target=')) {
      const value = arg.slice('--target='.length)
      if (value !== 'web' && value !== 'weapp') {
        throw new Error('Option "--target" must be "web" or "weapp".')
      }
      target = value
      continue
    }
    if (arg !== undefined) {
      forwarded.push(arg)
    }
  }
  return { argv: forwarded, target }
}

function resolveOfficialCli() {
  const packageJson = require.resolve('@tailwindcss/cli/package.json')
  return path.resolve(path.dirname(packageJson), 'dist/index.mjs')
}

function spawnOfficial(argv: string[], stdio: 'inherit' | ['inherit', 'pipe', 'inherit'] = 'inherit') {
  return spawn(process.execPath, [resolveOfficialCli(), ...argv], {
    cwd: process.cwd(),
    env: process.env,
    stdio,
  })
}

function waitForExit(child: ReturnType<typeof spawn>) {
  return new Promise<number>((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) {
        resolve(1)
      }
      else {
        resolve(code ?? 1)
      }
    })
  })
}

function findOption(argv: string[], long: string, short?: string) {
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === long || (short && arg === short)) {
      return argv[index + 1] ?? true
    }
    if (arg?.startsWith(`${long}=`)) {
      return arg.slice(long.length + 1)
    }
  }
  return undefined
}

function hasOption(argv: string[], long: string, short?: string) {
  return argv.some(arg => arg === long || (short !== undefined && arg === short) || arg.startsWith(`${long}=`))
}

function replaceOutput(argv: string[], output: string) {
  const result: string[] = []
  let replaced = false
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--output' || arg === '-o') {
      result.push(arg, output)
      index++
      replaced = true
    }
    else if (arg?.startsWith('--output=')) {
      result.push(`--output=${output}`)
      replaced = true
    }
    else if (arg !== undefined) {
      result.push(arg)
    }
  }
  if (!replaced) {
    result.push('--output', output)
  }
  return result
}

async function writeWeappOutput(webOutput: string, output: string | boolean | undefined, cwd: string) {
  const css = await fs.readFile(webOutput, 'utf8')
  const { transformTailwindV4CssToWeapp } = await import('@/generator')
  const transformed = await transformTailwindV4CssToWeapp(css)
  if (output === undefined || output === true || output === '-') {
    process.stdout.write(`${transformed}\n`)
    return
  }
  const outputPath = path.resolve(cwd, output)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, transformed)
}

async function runWeapp(argv: string[]) {
  if (argv[0] === 'canonicalize') {
    return waitForExit(spawnOfficial(argv))
  }
  if (hasOption(argv, '--map')) {
    throw new Error('Option "--map" is only supported when "--target web" is used.')
  }

  const cwdOption = findOption(argv, '--cwd')
  const cwd = typeof cwdOption === 'string' ? path.resolve(cwdOption) : process.cwd()
  const input = findOption(argv, '--input', '-i')
  const output = findOption(argv, '--output', '-o')
  if (typeof input === 'string' && input !== '-' && typeof output === 'string' && output !== '-') {
    const inputPath = path.resolve(cwd, input)
    const outputPath = path.resolve(cwd, output)
    if (inputPath === outputPath) {
      throw new Error('Input and output paths must be different; received identical paths.')
    }
  }
  const watch = findOption(argv, '--watch', '-w')
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'weapp-tw-cli-'))
  const webOutput = path.join(temporaryDirectory, 'output.css')
  const forwarded = replaceOutput(argv, webOutput)
  let lastCss = ''

  const render = async () => {
    try {
      const css = await fs.readFile(webOutput, 'utf8')
      if (css === lastCss) {
        return
      }
      lastCss = css
      await writeWeappOutput(webOutput, output, cwd)
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  if (!watch) {
    try {
      const exitCode = await waitForExit(spawnOfficial(forwarded))
      if (exitCode === 0) {
        await render()
      }
      return exitCode
    }
    finally {
      await fs.rm(temporaryDirectory, { recursive: true, force: true })
    }
  }

  const watcher = (await import('@parcel/watcher')).subscribe(temporaryDirectory, render)
  const child = spawnOfficial(forwarded)
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
  const signalHandlers = new Map<NodeJS.Signals, () => void>()
  for (const signal of signals) {
    const handler = () => child.kill(signal)
    signalHandlers.set(signal, handler)
    process.once(signal, handler)
  }
  try {
    return await waitForExit(child)
  }
  finally {
    for (const signal of signals) {
      process.off(signal, signalHandlers.get(signal)!)
    }
    await (await watcher).unsubscribe()
    await fs.rm(temporaryDirectory, { recursive: true, force: true })
  }
}

export async function runTailwindCli(rawArgv: string[]) {
  const { argv, target } = parseTarget(rawArgv)
  if (target === 'web') {
    return waitForExit(spawnOfficial(argv))
  }
  return runWeapp(argv)
}
