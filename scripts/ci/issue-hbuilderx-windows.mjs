import { Buffer } from 'node:buffer'
import { spawn, spawnSync } from 'node:child_process'
import { appendFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { version as osVersion, release, tmpdir } from 'node:os'
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
const installRoot = path.join(process.env.RUNNER_TEMP ?? tmpdir(), `issue-hbuilderx-${version}`)
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
      if (name !== 'help') {
        process.stdout.write(chunk)
      }
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
if (process.env.HBUILDERX_RESTART === '1') {
  process.env.HBUILDERX_OWNED_EXE = path.join(installRoot, directory, 'HBuilderX.exe')
  await command('pwsh', ['-NoProfile', '-Command', 'Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq $env:HBUILDERX_OWNED_EXE } | ForEach-Object { taskkill /PID $_.ProcessId /T /F }'], 'stop-owned-ide')
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
let commandsReady = false
for (let attempt = 0; attempt < 60; attempt++) {
  const help = await command(cli, ['help'], 'help')
  if (help.includes('installPlugin')) {
    commandsReady = true
    break
  }
  await delay(1000)
}
if (!commandsReady) {
  throw new Error('IDE 已启动，但插件提供的 installPlugin 命令尚未注册。')
}
for (const plugin of ['uniapp-cli-vite', 'uniappx-launcher', 'compile-dart-sass', 'chrome-base']) {
  const output = await command(cli, ['installPlugin', '--name', plugin], `install-${plugin}`, 600_000)
  if (/does not exist|当前命令执行错误|安装失败/.test(output)) {
    throw new Error(`插件安装未完成：${plugin}\n${output}`)
  }
  JSON.parse(await readFile(path.join(installRoot, directory, 'plugins', plugin, 'package.json'), 'utf8'))
}
const plugins = path.join(installRoot, directory, 'plugins')
const compilerNode = await command(path.join(plugins, 'node', 'node.exe'), ['--version'], 'compiler-node')
const vite = JSON.parse(await readFile(path.join(plugins, 'uniapp-cli-vite', 'node_modules', 'vite', 'package.json'), 'utf8'))
await writeFile(path.join(artifactRoot, 'identity.json'), JSON.stringify({
  platform: process.platform,
  arch: process.arch,
  node: process.version,
  os: osVersion(),
  release: release(),
  compilerNode: compilerNode.trim(),
  vite: vite.version,
  version: actualVersion,
  cli,
  url,
  revision: process.env.GITHUB_SHA,
}, null, 2))
if (process.env.GITHUB_ENV) {
  await appendFile(process.env.GITHUB_ENV, `HBUILDERX_CLI_PATH=${cli}\n`)
}
console.log(`Windows HBuilderX ${version} 已准备：${cli}`)
