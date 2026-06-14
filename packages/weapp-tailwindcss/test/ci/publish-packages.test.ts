import { execFile } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const workspaceRoot = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)))
const scriptPath = path.join(workspaceRoot, 'scripts/publish-packages.mjs')

async function runPublishPackages(args: string[]) {
  const { stdout } = await execFileAsync(process.execPath, [scriptPath, ...args], {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      HUSKY: '0',
    },
  })

  return stdout
}

describe('publish-packages release phases', () => {
  it('main version phase only updates changesets', async () => {
    const stdout = await runPublishPackages(['--dry-run', '--branch', 'main', '--phase', 'version'])

    expect(stdout).toContain('[dry-run] pnpm changeset version')
    expect(stdout).not.toContain('[dry-run] pnpm build')
    expect(stdout).not.toContain('[dry-run] pnpm test:release')
    expect(stdout).not.toContain('[dry-run] pnpm changeset publish')
  })

  it('main publish phase keeps build and test guards', async () => {
    const stdout = await runPublishPackages(['--dry-run', '--branch', 'main'])

    expect(stdout).toContain('[dry-run] pnpm build')
    expect(stdout).toContain('[dry-run] pnpm test:release')
    expect(stdout).toContain('[dry-run] pnpm changeset publish')
  })

  it('prerelease version phase enters pre mode without running full tests', async () => {
    const stdout = await runPublishPackages(['--dry-run', '--branch', 'beta', '--phase', 'version'])

    expect(stdout).toContain('[dry-run] pnpm changeset pre enter beta')
    expect(stdout).toContain('[dry-run] pnpm changeset version')
    expect(stdout).not.toContain('[dry-run] pnpm build')
    expect(stdout).not.toContain('[dry-run] pnpm test:release')
  })
})
