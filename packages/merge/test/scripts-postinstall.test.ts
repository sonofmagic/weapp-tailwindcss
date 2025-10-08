import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

const requireFn = createRequire(import.meta.url)
const testDir = path.dirname(fileURLToPath(import.meta.url))
const scriptPath = path.resolve(testDir, '../scripts/postinstall.cjs')
const builtScriptPath = path.resolve(testDir, '../dist/postinstall.cjs')
const scriptSource = fs.readFileSync(scriptPath, 'utf8')

function executeLegacyPostinstall(hasBuiltScript: boolean) {
  const existsSync = vi.fn(() => hasBuiltScript)
  let distModuleLoads = 0
  const consoleLog = vi.fn()

  const contextRequire = (specifier: string) => {
    if (specifier === 'node:fs') {
      return {
        existsSync,
      }
    }
    if (specifier === 'node:path') {
      return requireFn('node:path')
    }
    if (specifier === builtScriptPath) {
      distModuleLoads += 1
      return {}
    }
    throw new Error(`Unexpected require: ${specifier}`)
  }

  const context = {
    require: contextRequire,
    module: { exports: {} },
    exports: {},
    __dirname: path.dirname(scriptPath),
    console: { log: consoleLog },
  }

  vm.runInNewContext(scriptSource, context, { filename: scriptPath })

  return {
    existsSync,
    consoleLog,
    distModuleLoads,
  }
}

describe('legacy postinstall entry', () => {
  it('skips when built postinstall script is missing', () => {
    const result = executeLegacyPostinstall(false)

    expect(result.existsSync).toHaveBeenCalledWith(builtScriptPath)
    expect(result.consoleLog).toHaveBeenCalledWith('postinstall.cjs not found')
    expect(result.distModuleLoads).toBe(0)
  })

  it('loads built postinstall script when present', () => {
    const result = executeLegacyPostinstall(true)

    expect(result.existsSync).toHaveBeenCalledWith(builtScriptPath)
    expect(result.consoleLog).not.toHaveBeenCalled()
    expect(result.distModuleLoads).toBe(1)
  })
})
