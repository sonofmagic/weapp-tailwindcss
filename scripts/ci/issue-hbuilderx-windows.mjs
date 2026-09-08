import { Buffer } from 'node:buffer'
import { spawn, spawnSync } from 'node:child_process'
import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

if (process.platform !== 'win32') {
  throw new Error('该入口用于真实 Windows HBuilderX 验证，不能用平台模拟代替。')
}
const version = process.env.HBUILDERX_VERSION
if (!['5.24.2026081301', '5.25.2026082902-alpha'].includes(version)) {
  throw new Error(`未登记的 HBuilderX 验证版本：${version}`)
}
const artifactRoot = path.resolve('e2e', '.artifacts', 'issue-hbuilderx-windows')
const installRoot = path.join(tmpdir(), `issue-hbuilderx-${version}`)
const directory = version.includes('alpha') ? 'HBuilderX-Alpha' : 'HBuilderX'
const cli = path.join(installRoot, directory, 'cli.exe')
await mkdir(artifactRoot, { recursive: true })

async function exists(file) {
  return readFile(file).then(() => true, () => false)
}

async function command(executable, args, name, timeout = 120_000) {
  const child = spawn(executable, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => {
      output += chunk.toString()
      process.stdout.write(chunk)
    })
  }
  let timer
  try {
    const exit = await new Promise((resolve, reject) => {
      child.once('error', reject)
      child.once('close', resolve)
      timer = setTimeout(() => {
        spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, timeout: 5000 })
        reject(new Error(`${name} 超过 ${timeout}ms`))
      }, timeout)
    })
    if (exit !== 0) {
      throw new Error(`${name} 退出码 ${exit}`)
    }
    return output
  }
  finally {
    clearTimeout(timer)
    await writeFile(path.join(artifactRoot, `${name}.log`), output)
  }
}

const url = `https://download1.dcloud.net.cn/download/HBuilderX.${version}.zip`
if (!await exists(cli)) {
  await mkdir(installRoot, { recursive: true })
  const zip = path.join(installRoot, 'official.zip')
  const response = await fetch(url, { signal: AbortSignal.timeout(180_000) })
  if (!response.ok) {
    throw new Error(`官方安装包下载失败：${response.status} ${url}`)
  }
  await writeFile(zip, Buffer.from(await response.arrayBuffer()))
  await command('7z', ['x', zip, `-o${installRoot}`, '-y'], 'extract')
  if (directory !== 'HBuilderX') {
    await rename(path.join(installRoot, 'HBuilderX'), path.join(installRoot, directory))
  }
}
await command(cli, ['open'], 'open')
let actualVersion = ''
for (let attempt = 0; attempt < 30; attempt++) {
  actualVersion = await command(cli, ['version'], 'version')
  if (actualVersion.includes(version)) {
    break
  }
  await delay(1000)
}
if (!actualVersion.includes(version)) {
  throw new Error(`Windows IDE 版本不匹配：${actualVersion}`)
}
for (const plugin of ['uniapp-cli-vite', 'uniappx-launcher', 'compile-dart-sass', 'chrome-base']) {
  await command(cli, ['installPlugin', '--name', plugin], `install-${plugin}`, 600_000)
}
await writeFile(path.join(artifactRoot, 'identity.json'), JSON.stringify({
  platform: process.platform,
  arch: process.arch,
  node: process.version,
  version: actualVersion,
  cli,
  url,
  revision: process.env.GITHUB_SHA,
}, null, 2))
if (process.env.GITHUB_ENV) {
  await appendFile(process.env.GITHUB_ENV, `HBUILDERX_CLI_PATH=${cli}\n`)
}
console.log(`Windows HBuilderX ${version} 已准备：${cli}`)
