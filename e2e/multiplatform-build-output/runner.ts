import type { BuildOutputCase } from './types'
import fs from 'node:fs/promises'
import process from 'node:process'
import { execa } from 'execa'
import fg from 'fast-glob'
import path from 'pathe'
import { expect } from 'vitest'
import { clearProjectBuildState } from '../projectTest'

const textExtensions = /\.(?:js|json|html|css|wxss|acss|jxss|qss|ttss|wxml|axml|qml|swan|ttml|uvue)$/i

async function pathExists(file: string) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

async function readMaybeDirectory(root: string, target: string) {
  const absolute = path.resolve(root, target)
  const stat = await fs.stat(absolute)
  if (stat.isFile()) {
    return fs.readFile(absolute, 'utf8')
  }

  const files = await fg('**/*', {
    absolute: true,
    cwd: absolute,
    onlyFiles: true,
  })
  const texts: string[] = []
  for (const file of files.sort()) {
    if (textExtensions.test(file)) {
      texts.push(await fs.readFile(file, 'utf8'))
    }
  }
  return texts.join('\n')
}

function expectNeedle(content: string, needle: string | RegExp, label: string) {
  if (typeof needle === 'string') {
    expect(content, label).toContain(needle)
    return
  }
  expect(content, label).toMatch(needle)
}

async function runBuildCase(item: BuildOutputCase, projectRoot: string, repoRoot: string) {
  await clearProjectBuildState(projectRoot)

  const [command, ...args] = item.command
  const cwd = item.commandCwd === 'repo' ? repoRoot : projectRoot
  await execa(command, args, {
    cwd,
    env: {
      ...process.env,
      ...item.env,
      NODE_ENV: 'production',
      BROWSERSLIST_ENV: 'production',
      TARO_BUILD_STRICT: '1',
      UNI_BUILD_STRICT: '1',
      npm_package_json: path.resolve(projectRoot, 'package.json'),
      INIT_CWD: projectRoot,
    },
    stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
  })
}

export async function verifyBuildOutputCase(item: BuildOutputCase) {
  const repoRoot = path.resolve(__dirname, '../..')
  const projectRoot = path.resolve(repoRoot, item.projectDir)
  const outputRoot = path.resolve(projectRoot, item.outputDir)
  const skipBuild = process.env['E2E_MULTIPLATFORM_BUILD_SKIP_BUILD'] === '1'

  if (!skipBuild) {
    await runBuildCase(item, projectRoot, repoRoot)
  }

  expect(await pathExists(outputRoot), `${item.name} should emit ${item.outputDir}`).toBe(true)

  for (const file of item.requiredFiles) {
    expect(await pathExists(path.resolve(projectRoot, file)), `${item.name} should emit ${file}`).toBe(true)
  }

  const styles = (await Promise.all(item.styleFiles.map(file => readMaybeDirectory(projectRoot, file)))).join('\n')
  expect(styles.length, `${item.name} should emit readable style output`).toBeGreaterThan(0)
  for (const needle of item.styleContains) {
    expectNeedle(styles, needle, `${item.name} style output should contain ${String(needle)}`)
  }

  const texts = item.textFiles
    ? (await Promise.all(item.textFiles.map(file => readMaybeDirectory(projectRoot, file)))).join('\n')
    : ''
  for (const needle of item.textContains ?? []) {
    expectNeedle(texts, needle, `${item.name} text output should contain ${String(needle)}`)
  }

  const combined = `${styles}\n${texts}`
  for (const needle of item.notContains ?? []) {
    if (typeof needle === 'string') {
      expect(combined, `${item.name} output should not contain ${needle}`).not.toContain(needle)
    }
    else {
      expect(combined, `${item.name} output should not match ${String(needle)}`).not.toMatch(needle)
    }
  }
}
