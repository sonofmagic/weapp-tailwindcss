import { describe, it } from 'vitest'
import { webCases } from './hbuilderx-local/cases'
import { verifyWebHmr } from './hbuilderx-local/runner'

const run = process.env['E2E_ISSUE_1144_WEB'] === '1' ? describe : describe.skip

run('issue #1144 CLI Web runtime', () => {
  it('keeps pt and important styles current across saves and browser refresh', async () => {
    const item = webCases.find(item => item.name === 'issue-1144-uni-app-x-web')!
    await verifyWebHmr({ ...item, launchWithHBuilderX: false, serverLogContains: [] })
  }, 360_000)
})
