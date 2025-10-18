import { existsSync, mkdtempSync } from 'node:fs'
import { rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import {
  ensureConfigExists,
  readTemplateUrls,
  repoFolderName,
  resolveConfigPath,
  ROOT,
  toSshUrl,
} from './template-utils'

async function getCurrentBranch(dir: string): Promise<string> {
  const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: dir,
  })
  return stdout.trim()
}

async function syncTemplate(url: string): Promise<void> {
  const repoName = repoFolderName(url)
  if (!repoName) {
    console.warn(`无法从 ${url} 解析仓库名，跳过。`)
    return
  }
  const localDir = path.join(ROOT, 'templates', repoName)
  if (!existsSync(localDir)) {
    console.warn(`本地不存在目录 ${localDir}，跳过。`)
    return
  }

  const sshUrl = toSshUrl(url)
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), `template-sync-${repoName}-`))

  console.log(`\n>>> 克隆 ${sshUrl}`)
  await execa('git', ['clone', sshUrl, tmpDir], { stdio: 'inherit' })

  const branch = await getCurrentBranch(tmpDir)
  await execa('git', ['reset', '--hard', `origin/${branch}`], { cwd: tmpDir, stdio: 'inherit' })
  await execa('git', ['clean', '-fdx'], { cwd: tmpDir, stdio: 'inherit' })

  console.log(`同步 ${localDir} -> ${tmpDir}`)
  await execa(
    'rsync',
    ['-a', '--delete', '--exclude', '.git', `${localDir}/`, `${tmpDir}/`],
    { stdio: 'inherit' },
  )

  const { stdout } = await execa('git', ['status', '--porcelain'], { cwd: tmpDir })
  if (!stdout.trim()) {
    console.log('无变化，跳过推送。')
    await safeRemove(tmpDir)
    return
  }

  await execa('git', ['add', '.'], { cwd: tmpDir, stdio: 'inherit' })
  await execa('git', ['commit', '-m', 'chore: sync from monorepo'], { cwd: tmpDir, stdio: 'inherit' })
  await execa('git', ['push', 'origin', branch], { cwd: tmpDir, stdio: 'inherit' })
  await safeRemove(tmpDir)
}

async function safeRemove(dir: string): Promise<void> {
  try {
    const stats = await stat(dir)
    if (stats.isDirectory()) {
      await rm(dir, { recursive: true, force: true })
    }
  }
  catch {
    // ignore
  }
}

async function main(): Promise<void> {
  const configPath = resolveConfigPath()
  ensureConfigExists(configPath)
  const urls = readTemplateUrls(configPath)

  for (const url of urls) {
    if (typeof url !== 'string' || url.trim() === '') {
      continue
    }
    try {
      await syncTemplate(url)
    }
    catch (error) {
      console.error(`同步 ${url} 失败：`, error instanceof Error ? error.message : error)
      process.exitCode = 1
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
