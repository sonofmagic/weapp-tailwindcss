import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import {
  ensureCleanWorkingTree,
  ensureConfigExists,
  prepareTemplateCacheRepo,
  readTemplateUrls,
  repoFolderName,
  resolveConfigPath,
  ROOT,
  toSshUrl,
} from './template-utils'

const TEMPLATES_DIR = path.join(ROOT, 'templates')

async function main(): Promise<void> {
  const configPath = resolveConfigPath()
  ensureConfigExists(configPath)

  await ensureCleanWorkingTree('当前工作区存在未提交的变更，请提交或清理后再执行同步。')

  ensureTemplatesDir()

  const urls = readTemplateUrls(configPath)
  for (const url of urls) {
    if (typeof url !== 'string' || url.trim() === '') {
      continue
    }
    await syncTemplate(url)
  }

  console.log('\n模板同步完成。')
}

function ensureTemplatesDir(): void {
  if (!existsSync(TEMPLATES_DIR)) {
    mkdirSync(TEMPLATES_DIR, { recursive: true })
  }
}

async function syncTemplate(url: string): Promise<void> {
  const repoName = repoFolderName(url)
  if (!repoName) {
    throw new Error(`无法从 ${url} 解析仓库名。`)
  }

  const sshUrl = toSshUrl(url)
  const { repoDir, branch } = await prepareTemplateCacheRepo(repoName, sshUrl)
  const targetDir = path.join(TEMPLATES_DIR, repoName)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  console.log(`同步 ${repoDir} (${branch}) -> ${targetDir}`)
  await execa(
    'rsync',
    ['-a', '--delete', '--exclude', '.git', `${repoDir}/`, `${targetDir}/`],
    { stdio: 'inherit' },
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
