import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const cliPath = fileURLToPath(new URL('../bin/weapp-tailwindcss.js', import.meta.url))
const missingRuntimeModuleMessage = `${[
  '[weapp-tailwindcss] postinstall patch skipped because a runtime module is missing.',
  'Run `pnpm --filter weapp-tailwindcss build` before strict CLI validation.',
].join(' ')}\n`

export function isMissingRuntimeModuleOutput(output) {
  return /MODULE_NOT_FOUND|Cannot find module/.test(output)
}

export function resolvePostinstallPatchExitCode(result) {
  if (result.error) {
    return {
      code: 0,
      message: `[weapp-tailwindcss] postinstall patch skipped: ${result.error.message}\n`,
    }
  }

  if (result.status && isMissingRuntimeModuleOutput(`${result.stderr ?? ''}\n${result.stdout ?? ''}`)) {
    return {
      code: 0,
      message: missingRuntimeModuleMessage,
    }
  }

  return {
    code: result.status ?? 0,
  }
}

export function runPostinstallPatch() {
  const result = spawnSync(process.execPath, [cliPath, 'patch'], {
    encoding: 'utf8',
  })

  if (result.stdout) {
    process.stdout.write(result.stdout)
  }

  if (result.stderr) {
    process.stderr.write(result.stderr)
  }

  const resolved = resolvePostinstallPatchExitCode(result)
  if (resolved.message) {
    process.stderr.write(resolved.message)
  }

  process.exitCode = resolved.code
}

const entryPoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined
if (import.meta.url === entryPoint) {
  runPostinstallPatch()
}
