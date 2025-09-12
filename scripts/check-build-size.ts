import process from 'node:process'
import { getWorkspacePackages } from '@icebreakers/monorepo'
import fs from 'fs-extra'
import path from 'pathe'

interface FileInfo {
  file: string
  size: number
}

function walk(dir: string, baseDir: string): FileInfo[] {
  let results: FileInfo[] = []
  const list = fs.readdirSync(dir)

  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      results = results.concat(walk(filePath, baseDir))
    }
    else {
      results.push({
        file: path.relative(baseDir, filePath),
        size: stat.size,
      })
    }
  }
  return results
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function scan({ buildDir, name }: { buildDir: string, name?: string }) {
  if (!fs.existsSync(buildDir)) {
    console.error(`❌ ${name} Build directory not found: ${buildDir}`)
    process.exit(1)
  }

  const files = walk(buildDir, buildDir).sort((a, b) => b.size - a.size)

  console.log(`📦 ${name} Build artifacts size:\n`)
  for (const f of files) {
    console.log(
      `${f.file.padEnd(40)} ${formatSize(f.size).padStart(10)}`,
    )
  }
}

async function main() {
  const workspaceDir = process.cwd()
  const packages = await getWorkspacePackages(workspaceDir)
  for (const pkg of packages) {
    const buildDir = path.join(pkg.rootDir, 'dist')
    scan({ buildDir, name: pkg.manifest.name! })
  }
}

main()
