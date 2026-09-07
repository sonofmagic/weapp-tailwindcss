const assert = require('node:assert/strict')
const { mkdtemp, realpath, rm } = require('node:fs/promises')
const { createRequire } = require('node:module')
const { tmpdir } = require('node:os')
const path = require('node:path')
const process = require('node:process')
const { setTimeout: delay } = require('node:timers/promises')

const demoRequire = createRequire(path.resolve('demo/subpackage-taro-webpack-react-tailwindcss-v4/package.json'))
const taroRequire = createRequire(demoRequire.resolve('@tarojs/webpack5-runner/package.json'))
const webpack = taroRequire('webpack')
const VirtualModulesPlugin = taroRequire('webpack-virtual-modules')

async function main() {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'demo-virtual-watch-')))
  const file = path.join(root, 'virtual-entry.js')
  const modules = new VirtualModulesPlugin({ [file]: 'export default 42' })
  const compiler = webpack({ mode: 'development', context: root, entry: file, output: { path: path.join(root, 'dist') }, plugins: [modules] })
  // 编译跨过轮询间隔，稳定复现虚拟文件被重复报告缺失的条件。
  compiler.hooks.beforeCompile.tapPromise('BuildDuration', () => delay(100))
  let builds = 0
  let buildError
  const watcher = compiler.watch({ aggregateTimeout: 100 }, (error, stats) => {
    builds++
    if (error || stats.hasErrors()) {
      buildError = error ?? new Error(stats.toString({ all: false, errors: true }))
    }
  })
  async function waitForBuild(previous) {
    const deadline = Date.now() + 10_000
    while (builds <= previous && Date.now() < deadline) {
      await delay(25)
    }
    assert.ifError(buildError)
    assert.ok(builds > previous, 'The virtual module update did not rebuild')
  }
  try {
    await waitForBuild(0)
    await delay(1500)
    const initialBuilds = builds
    assert.ok(initialBuilds <= 2, `Idle virtual module repeatedly rebuilt: ${initialBuilds}`)
    modules.writeModule(file, 'export default 84')
    await waitForBuild(initialBuilds)
    const updatedBuilds = builds
    await delay(1000)
    assert.ifError(buildError)
    assert.equal(builds, updatedBuilds, 'Virtual module update did not settle')
    process.stdout.write(`${JSON.stringify({ initialBuilds, updatedBuilds })}\n`)
  }
  finally {
    await new Promise((resolve, reject) => watcher.close(error => error ? reject(error) : resolve()))
    await new Promise((resolve, reject) => compiler.close(error => error ? reject(error) : resolve()))
    await rm(root, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
