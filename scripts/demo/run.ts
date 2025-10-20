import type { PackageJson } from 'pkg-types'
import process from 'node:process'
import consola from 'consola'
import { execaCommand } from 'execa'
import fs from 'fs-extra'
import { getPackageInfo } from 'local-pkg'
import path from 'pathe'

async function setJson(p: string, key: string, flag: any) {
  const json = (await fs.exists(p)) ? JSON.parse(await fs.readFile(p, 'utf8')) : {}
  json[key] = flag
  await fs.writeFile(p, JSON.stringify(json, null, 2), 'utf8')
}

// const divideString = '-'.repeat(process.stdout.columns)

type PackageInfo = {
  name: string
  version: string | undefined
  rootPath: string
  packageJsonPath: string
  packageJson: PackageJson
} | undefined

type PackageManager = 'pnpm' | 'yarn' | 'npm'

type CommandCallback = string | null | undefined | ((pkgInfo: PackageInfo, packageManager: PackageManager) => string | null | undefined)

function parsePackageManagerFromUserAgent(userAgent?: string): PackageManager | undefined {
  if (!userAgent) {
    return
  }

  if (userAgent.includes('pnpm')) {
    return 'pnpm'
  }

  if (userAgent.includes('yarn')) {
    return 'yarn'
  }

  if (userAgent.includes('npm')) {
    return 'npm'
  }
}

async function findUpPackageManagerField(startDir: string): Promise<PackageManager | undefined> {
  let current = startDir
  while (true) {
    const pkgPath = path.resolve(current, 'package.json')
    if (await fs.pathExists(pkgPath)) {
      try {
        const json = JSON.parse(await fs.readFile(pkgPath, 'utf8')) as { packageManager?: string }
        const manager = json.packageManager?.split('@')[0]
        if (manager === 'pnpm' || manager === 'yarn' || manager === 'npm') {
          return manager
        }
      }
      catch {
        // malformed package.json, ignore
      }
    }
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }
}

async function findUpLockfile(startDir: string): Promise<PackageManager | undefined> {
  const lookups: Array<[string, PackageManager]> = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
    ['npm-shrinkwrap.json', 'npm'],
  ]
  let current = startDir
  while (true) {
    for (const [filename, manager] of lookups) {
      if (await fs.pathExists(path.resolve(current, filename))) {
        return manager
      }
    }
    const parent = path.dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }
}

async function detectPackageManager(startDir: string): Promise<PackageManager> {
  const fromPackageJson = await findUpPackageManagerField(startDir)
  if (fromPackageJson) {
    return fromPackageJson
  }

  const fromLockfile = await findUpLockfile(startDir)
  if (fromLockfile) {
    return fromLockfile
  }

  const fromEnv = parsePackageManagerFromUserAgent(process.env.npm_config_user_agent)
  if (fromEnv) {
    return fromEnv
  }

  return 'pnpm'
}

function normalizeCommand(command: string, packageManager: PackageManager): string {
  const trimmed = command.trim()
  if (!trimmed) {
    return trimmed
  }

  if (!trimmed.startsWith('yarn')) {
    return trimmed
  }

  const rest = trimmed.slice('yarn'.length).trim()
  const tokens = rest.split(/\s+/).filter(Boolean)
  const filteredTokens = tokens.filter(token => token !== '--ignore-engines')

  if (packageManager === 'yarn') {
    return rest ? `yarn ${rest}` : 'yarn'
  }

  if (packageManager === 'pnpm') {
    if (filteredTokens.length === 0) {
      return 'pnpm install'
    }
    if (filteredTokens[0] === 'add') {
      const args = filteredTokens.slice(1).join(' ')
      return args ? `pnpm add ${args}` : 'pnpm add'
    }
    if (filteredTokens[0].startsWith('--') || filteredTokens[0].startsWith('-')) {
      const args = filteredTokens.join(' ')
      return args ? `pnpm install ${args}` : 'pnpm install'
    }
    if (filteredTokens[0] === 'run') {
      const scriptArgs = filteredTokens.slice(1).join(' ')
      return scriptArgs ? `pnpm run ${scriptArgs}` : 'pnpm run'
    }
    const [script, ...scriptArgs] = filteredTokens
    return `pnpm run ${[script, ...scriptArgs].join(' ')}`
  }

  if (packageManager === 'npm') {
    if (filteredTokens.length === 0) {
      return 'npm install'
    }
    if (filteredTokens[0] === 'add') {
      const npmTokens = filteredTokens.slice(1).map((token) => {
        if (token === '-D') {
          return '--save-dev'
        }
        return token
      })
      const args = npmTokens.join(' ')
      return args ? `npm install ${args}` : 'npm install'
    }
    if (filteredTokens[0].startsWith('--') || filteredTokens[0].startsWith('-')) {
      const args = filteredTokens.join(' ')
      return args ? `npm install ${args}` : 'npm install'
    }
    if (filteredTokens[0] === 'run') {
      const scriptArgs = filteredTokens.slice(1).join(' ')
      return scriptArgs ? `npm run ${scriptArgs}` : 'npm run'
    }
    return `npm run ${filteredTokens.join(' ')}`
  }

  return trimmed
}

async function execa(opts: {
  command: CommandCallback
  cwd: string
  packageManager: PackageManager
}): Promise<boolean> {
  const { command, cwd, packageManager } = opts
  let rawCommand: string | null | undefined
  if (typeof command === 'string' || command === null || command === undefined) {
    rawCommand = command
  }
  else {
    const pkgInfo = await getPackageInfo(cwd)
    rawCommand = command(pkgInfo, packageManager)
  }
  if (!rawCommand) {
    return false
  }
  const cmd = normalizeCommand(rawCommand, packageManager)
  if (!cmd) {
    return false
  }
  await execaCommand(cmd, {
    cwd,
    stdio: 'inherit',
  })
  return true
}

async function run(dirPath: string, command: CommandCallback) {
  const packageManager = await detectPackageManager(dirPath)

  const filenames = await fs.readdir(dirPath)
  for (const filename of filenames) {
    const baseDir = path.resolve(dirPath, filename)
    const stat = await fs.stat(baseDir)
    if (stat.isDirectory()) {
      const pkgPath = path.resolve(baseDir, 'package.json')
      if (await fs.exists(pkgPath)) {
        // console.log(divideString)
        // console.log(`[${filename}]:${baseDir}`)
        // console.log(divideString)
        try {
          await execa({
            command,
            cwd: baseDir,
            packageManager,
          })
          await setJson(path.resolve(dirPath, 'result.json'), filename, true)
        }
        catch (e) {
          consola.error(e)
          await setJson(path.resolve(dirPath, 'result.json'), filename, false)
        }
      }
    }
  }
}

export {
  detectPackageManager,
  run,
}
