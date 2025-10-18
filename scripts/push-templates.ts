import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  ensureCleanWorkingTree,
  ensureConfigExists,
  readTemplateUrls,
  repoFolderName,
  resolveConfigPath,
  resolveDefaultBranch,
  ROOT,
  runGit,
  toSshUrl,
} from './template-utils'

async function main(): Promise<void> {
  const configPath = resolveConfigPath()
  ensureConfigExists(configPath)

  await ensureCleanWorkingTree('当前工作区存在未提交的变更，请先提交或清理后再执行推送。')

  const urls = readTemplateUrls(configPath)
  for (const url of urls) {
    if (typeof url !== 'string' || url.trim() === '') {
      continue
    }
    await pushTemplate(url)
  }

  console.log('\n模板推送完成。')
}

async function pushTemplate(url: string): Promise<void> {
  const repoName = repoFolderName(url)
  if (!repoName) {
    throw new Error(`无法从 ${url} 解析仓库名。`)
  }

  const prefix = path.posix.join('templates', repoName)
  const absPath = path.join(ROOT, prefix)
  if (!existsSync(absPath)) {
    console.warn(`未找到 ${prefix} 目录，跳过推送。`)
    return
  }

  const repo = toSshUrl(url)
  const branch = await resolveDefaultBranch(repo)
  const args = ['subtree', 'push', '--prefix', prefix, repo, branch]

  console.log(`\n>>> git ${args.join(' ')}`)

  try {
    await runGit(args)
  }
  catch (error) {
    throw new Error(`[${repoName}] git subtree push 失败：${(error as Error).message}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
