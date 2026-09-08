import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { expect, it } from 'vitest'
import { webCases } from './hbuilderx-local/cases'
import { withIssue1144Setup } from './hbuilderx-local/issue-1144-source'
import { verifyWebHmr } from './hbuilderx-local/runner'

const projectRoot = process.env['E2E_RELEASE_PROJECT_ROOT']
it.skipIf(!projectRoot).each(['options', 'setup'])('npm 5.5.2 alpha 16 saves and two refreshes: %s', async (mode) => {
  const require = createRequire(path.join(projectRoot!, 'package.json'))
  expect(require('weapp-tailwindcss/package.json').version).toBe('5.5.2')
  const entry = require.resolve('weapp-tailwindcss/vite')
  expect(path.relative(projectRoot!, entry).startsWith('..')).toBe(false)
  process.stdout.write(`${JSON.stringify({ projectRoot, entry, mode })}\n`)
  const item = { ...webCases.find(x => x.name === 'issue-1144-uni-app-x-web')!, projectDir: projectRoot!, launchWithHBuilderX: true }
  if (mode === 'setup') {
    await withIssue1144Setup(projectRoot!, () => verifyWebHmr(item))
  }
  else {
    await verifyWebHmr(item)
  }
}, 360_000)
