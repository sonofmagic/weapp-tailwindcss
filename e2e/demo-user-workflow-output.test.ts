import type { DemoUserWorkflowAssertion } from './demo-user-workflow-cases'
import fs from 'node:fs/promises'
import fg from 'fast-glob'
import path from 'pathe'
import { describe, expect, it } from 'vitest'
import { DEMO_USER_WORKFLOW_CASES } from './demo-user-workflow-cases'
import { verifyBuildOutputCase } from './multiplatform-build-output/runner'

const textOutputRE = /\.(?:js|json|html|css|wxss|acss|jxss|qss|ttss|wxml|axml|qml|swan|ttml|vue|tsx|ts|mpx)$/i

async function readOutput(root: string, target: string) {
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
  const chunks: string[] = []
  for (const file of files.sort()) {
    if (textOutputRE.test(file)) {
      chunks.push(await fs.readFile(file, 'utf8'))
    }
  }
  return chunks.join('\n')
}

function expectContains(content: string, item: string | RegExp, message: string) {
  if (typeof item === 'string') {
    expect(content, message).toContain(item)
    return
  }
  expect(content, message).toMatch(item)
}

async function verifyWorkflowAssertion(projectRoot: string, assertion: DemoUserWorkflowAssertion) {
  const content = (await Promise.all(assertion.files.map(file => readOutput(projectRoot, file)))).join('\n')
  expect(content.length, `${assertion.label} should read output content`).toBeGreaterThan(0)

  for (const item of assertion.contains ?? []) {
    expectContains(content, item, `${assertion.label} should contain ${String(item)}`)
  }

  for (const item of assertion.notContains ?? []) {
    if (typeof item === 'string') {
      expect(content, `${assertion.label} should not contain ${item}`).not.toContain(item)
    }
    else {
      expect(content, `${assertion.label} should not match ${String(item)}`).not.toMatch(item)
    }
  }
}

describe('demo user workflow build output', () => {
  it.each(DEMO_USER_WORKFLOW_CASES)('keeps $name working for normal user development surfaces', async (item) => {
    await verifyBuildOutputCase(item)

    const repoRoot = path.resolve(__dirname, '..')
    const projectRoot = path.resolve(repoRoot, item.projectDir)
    for (const assertion of item.userWorkflow.assertions) {
      await verifyWorkflowAssertion(projectRoot, assertion)
    }
  }, 1_200_000)
})
