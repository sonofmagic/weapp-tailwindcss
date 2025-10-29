import { existsSync, mkdirSync } from 'node:fs'
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
  const cacheRoot = path.join(ROOT, '.cache', 'template-repos')
  if (!existsSync(cacheRoot)) {
    mkdirSync(cacheRoot, { recursive: true })
  }

  const repoDir = path.join(cacheRoot, repoName)
  if (!existsSync(repoDir)) {
    console.log(`\n>>> 首次克隆 ${sshUrl} 到 ${repoDir}`)
    await execa('git', ['clone', sshUrl, repoDir], { stdio: 'inherit' })
  }
  else {
    console.log(`\n>>> 使用缓存仓库 ${repoDir}`)
    try {
      const { stdout: remoteUrl } = await execa('git', ['remote', 'get-url', 'origin'], { cwd: repoDir })
      if (remoteUrl.trim() !== sshUrl) {
        console.warn(`缓存仓库的 origin 与配置不符，更新为 ${sshUrl}`)
        await execa('git', ['remote', 'set-url', 'origin', sshUrl], { cwd: repoDir, stdio: 'inherit' })
      }
    }
    catch {
      await execa('git', ['remote', 'add', 'origin', sshUrl], { cwd: repoDir, stdio: 'inherit' })
    }
  }

  await execa('git', ['fetch', 'origin'], { cwd: repoDir, stdio: 'inherit' })

  const branch = await getCurrentBranch(repoDir)
  await execa('git', ['reset', '--hard', `origin/${branch}`], { cwd: repoDir, stdio: 'inherit' })
  await execa('git', ['clean', '-fdx'], { cwd: repoDir, stdio: 'inherit' })

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
