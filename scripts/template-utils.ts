import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'

export const ROOT = process.cwd()
export const DEFAULT_TEMPLATES_JSONC = path.join(ROOT, 'templates.jsonc')

function stripCommentLines(content: string): string {
  return content
    .split(/\r?\n/u)
    .filter(line => !line.trimStart().startsWith('//'))
    .join('\n')
}

export function resolveConfigPath(): string {
  return process.env.TEMPLATES_CONFIG
    ? path.resolve(ROOT, process.env.TEMPLATES_CONFIG)
    : DEFAULT_TEMPLATES_JSONC
}

export function ensureConfigExists(configPath: string): void {
  if (!existsSync(configPath)) {
    console.error(`未找到 ${configPath}，操作无法继续。`)
    process.exit(1)
  }
}

export function readTemplateUrls(configPath: string): string[] {
  const raw = readFileSync(configPath, 'utf8')
  try {
    return JSON.parse(stripCommentLines(raw))
  }
  catch (error) {
    console.error('解析 templates.jsonc 失败，请确认文件格式正确。')
    throw error
  }
}

export function toSshUrl(url: string): string {
  const target = new URL(url)
  const repoPath = target.pathname.replace(/^\/+/u, '').replace(/\.git$/u, '')
  return `git@${target.host}:${repoPath}.git`
}

export function repoFolderName(url: string): string {
  const target = new URL(url)
  const segments = target.pathname.split('/').filter(Boolean)
  return segments.at(-1)?.replace(/\.git$/u, '') ?? ''
}

export async function resolveDefaultBranch(repo: string): Promise<string> {
  const { stdout } = await execa('git', ['ls-remote', '--symref', repo, 'HEAD'], {
    cwd: ROOT,
  })

  const refLine = stdout.split('\n').find(line => line.startsWith('ref: '))
  if (!refLine) {
    throw new Error(`无法解析 ${repo} 的默认分支。命令输出：\n${stdout}`)
  }

  const branchMatch = refLine.match(/refs\/heads\/(\S+)/u)
  if (!branchMatch) {
    throw new Error(`未找到 ${repo} 的默认分支信息。命令输出：\n${stdout}`)
  }

  return branchMatch[1]!
}

export async function ensureCleanWorkingTree(message: string): Promise<void> {
  const { stdout } = await execa('git', ['status', '--porcelain'], {
    cwd: ROOT,
  })
  if (stdout.trim().length > 0) {
    console.error(message)
    process.exit(1)
  }
}

export async function runGit(args: string[]): Promise<void> {
  await execa('git', args, {
    cwd: ROOT,
    stdio: 'inherit',
  })
}
