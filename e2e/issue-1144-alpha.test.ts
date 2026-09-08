import path from 'node:path'
import { describe, it } from 'vitest'
import { webCases } from './hbuilderx-local/cases'
import { withIssue1144Setup } from './hbuilderx-local/issue-1144-source'
import { verifyWebHmr } from './hbuilderx-local/runner'

const run = process.env['E2E_ISSUE_1144_ALPHA'] === '1' ? describe : describe.skip

run('issue #1144 HBuilderX alpha original setup', () => {
  it('keeps the original setup lifecycle and pt consumer current across 16 saves and refreshes', async () => {
    if (process.env['HBUILDERX_CHANNEL'] !== 'alpha') {
      throw new Error('此回归必须显式使用 HBUILDERX_CHANNEL=alpha')
    }
    const item = webCases.find(item => item.name === 'issue-1144-uni-app-x-web')!
    const projectRoot = path.resolve(__dirname, '..', item.projectDir)
    await withIssue1144Setup(projectRoot, () => verifyWebHmr(item))
  }, 360_000)
})
