import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import {
  ensureConfigExists,
  prepareTemplateCacheRepo,
  readTemplateUrls,
  repoFolderName,
  resolveConfigPath,
  ROOT,
  toSshUrl,
} from './template-utils'

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
  const { repoDir, branch } = await prepareTemplateCacheRepo(repoName, sshUrl)

  console.log(`同步 ${localDir} -> ${repoDir}`)
  await execa(
    'rsync',
    ['-a', '--delete', '--exclude', '.git', `${localDir}/`, `${repoDir}/`],
    { stdio: 'inherit' },
  )

  const { stdout } = await execa('git', ['status', '--porcelain'], { cwd: repoDir })
  if (!stdout.trim()) {
    console.log('无变化，跳过推送。')
    return
  }

  await execa('git', ['add', '.'], { cwd: repoDir, stdio: 'inherit' })
  await execa('git', ['commit', '-m', 'chore: sync from monorepo'], { cwd: repoDir, stdio: 'inherit' })
  await execa('git', ['push', 'origin', branch], { cwd: repoDir, stdio: 'inherit' })
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
