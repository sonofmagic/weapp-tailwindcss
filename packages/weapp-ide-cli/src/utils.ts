import type { AliasEntry } from './types'
import process from 'node:process'
import path from 'pathe'

export async function execute(cliPath: string, argv: string[]) {
  const { execa } = await import('execa')
  const task = execa(cliPath, argv)

  task?.stdout?.pipe(process.stdout)

  await task
  // 调用返回码为 0 时代表正常，为 -1 时错误。
  // task.exitCode === 0
  // task.exitCode === -1
}

export function resolvePath(filePath: string) {
  if (path.isAbsolute(filePath)) {
    return filePath
  }
  else {
    return path.resolve(process.cwd(), filePath)
  }
}

function alias(argv: string[], entry: AliasEntry) {
  let findIdx = argv.indexOf(entry.find)
  // alias -p as --project
  if (findIdx > -1) {
    argv[findIdx] = entry.replacement
  }
  else {
    findIdx = argv.indexOf(entry.replacement)
  }

  if (findIdx > -1) {
    const paramIdx = findIdx + 1
    const param = argv[paramIdx]
    // 存在项目目录
    if (param && param[0] !== '-') {
      argv[paramIdx] = resolvePath(param)
    }
    else {
      argv.splice(paramIdx, 0, process.cwd())
    }
  }
  return argv
}

function pathCompat(argv: string[], option: string) {
  const findIdx = argv.indexOf(option)

  if (findIdx > -1) {
    const paramIdx = findIdx + 1
    const param = argv[paramIdx]
    // 存在项目目录
    if (param && param[0] !== '-') {
      argv[paramIdx] = resolvePath(param)
    }
    else {
      argv.splice(paramIdx, 0, process.cwd())
    }
  }
  return argv
}

export function createAlias(entry: AliasEntry) {
  return function (argv: string[]) {
    return alias(argv, entry)
  }
}

export function createPathCompat(option: string) {
  return function (argv: string[]) {
    return pathCompat(argv, option)
  }
}
