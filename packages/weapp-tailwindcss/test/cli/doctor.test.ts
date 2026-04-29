import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createDoctorReport,
  formatDoctorReport,
  hasDoctorFailure,
} from '@/cli/doctor'

const TMP_PREFIX = 'weapp-tw-doctor'

async function createTempWorkspace() {
  return await mkdtemp(path.join(os.tmpdir(), TMP_PREFIX))
}

async function writeJson(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function writePackage(root: string, packageName: string, version: string) {
  await writeJson(path.join(root, 'node_modules', packageName, 'package.json'), {
    name: packageName,
    version,
  })
}

function findCheck(report: ReturnType<typeof createDoctorReport>, id: string) {
  const check = report.checks.find(item => item.id === id)
  if (!check) {
    throw new Error(`Missing doctor check: ${id}`)
  }
  return check
}

describe('createDoctorReport', () => {
  it('reports a healthy pnpm Tailwind v4 uni-app setup', async () => {
    const root = await createTempWorkspace()
    await writeJson(path.join(root, 'package.json'), {
      packageManager: 'pnpm@10.33.0',
      dependencies: {
        '@dcloudio/uni-app': '^3.0.0',
        '@tailwindcss/postcss': '^4.0.0',
        tailwindcss: '^4.0.0',
        'weapp-tailwindcss': '^4.0.0',
      },
    })
    await writeFile(path.join(root, 'postcss.config.js'), 'export default {}\n', 'utf8')
    await writeFile(path.join(root, 'vite.config.ts'), 'export default {}\n', 'utf8')
    await writePackage(root, 'tailwindcss', '4.1.0')
    await writePackage(root, 'weapp-tailwindcss', '4.12.0')

    const report = createDoctorReport({ cwd: root, nodeVersion: '20.19.0' })

    expect(report.detected.packageManager).toBe('pnpm@10.33.0')
    expect(report.detected.frameworks).toEqual(['uni-app'])
    expect(findCheck(report, 'tailwindcss').status).toBe('ok')
    expect(report.checks.find(item => item.id === 'tailwindcss-v4-postcss')).toBeUndefined()
    expect(hasDoctorFailure(report)).toBe(false)
  })

  it('warns when Tailwind v4 uses PostCSS without @tailwindcss/postcss', async () => {
    const root = await createTempWorkspace()
    await writeJson(path.join(root, 'package.json'), {
      dependencies: {
        tailwindcss: '^4.0.0',
        'weapp-tailwindcss': '^4.0.0',
      },
    })
    await writeFile(path.join(root, 'postcss.config.cjs'), 'module.exports = {}\n', 'utf8')
    await writePackage(root, 'tailwindcss', '4.0.0')

    const report = createDoctorReport({ cwd: root, nodeVersion: '20.19.0' })

    const check = findCheck(report, 'tailwindcss-v4-postcss')
    expect(check.status).toBe('warn')
    expect(check.suggestion).toContain('@tailwindcss/postcss')
    expect(hasDoctorFailure(report)).toBe(false)
    expect(hasDoctorFailure(report, true)).toBe(true)
  })

  it('reports blocking errors outside a project root', async () => {
    const root = await createTempWorkspace()
    const report = createDoctorReport({ cwd: root, nodeVersion: '16.20.0' })

    expect(findCheck(report, 'package-json').status).toBe('error')
    expect(findCheck(report, 'node-version').status).toBe('error')
    expect(findCheck(report, 'tailwindcss').status).toBe('error')
    expect(hasDoctorFailure(report)).toBe(true)
    expect(formatDoctorReport(report)).toContain('weapp-tailwindcss doctor')
  })

  it('uses the published Node.js version range', async () => {
    const root = await createTempWorkspace()
    await writeJson(path.join(root, 'package.json'), {
      dependencies: {
        tailwindcss: '^4.0.0',
        'weapp-tailwindcss': '^4.0.0',
      },
    })

    expect(findCheck(
      createDoctorReport({ cwd: root, nodeVersion: '22.0.0' }),
      'node-version',
    ).status).toBe('error')
    expect(findCheck(
      createDoctorReport({ cwd: root, nodeVersion: '22.12.0' }),
      'node-version',
    ).status).toBe('ok')
  })
})
