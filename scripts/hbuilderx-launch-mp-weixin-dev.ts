/// <reference types="node" />

import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { createHBuilderXRunner } from '../packages/hbuilderx-runner/src/index'
import { createHBuilderXProjectAlias } from './hbuilderx-project-alias.mjs'

async function main() {
  const projectRoot = process.cwd()
  const compileOnly = process.env.HBUILDERX_COMPILE_ONLY === '1'
  const projectAlias = await createHBuilderXProjectAlias(projectRoot)
  const projectName = process.env.HBUILDERX_PROJECT_NAME || projectAlias.projectName
  const hbuilderx = await createHBuilderXRunner({ cwd: projectRoot })
  const { channel, host, path, version } = hbuilderx.resolution
  process.stdout.write(`[hbuilderx] channel=${channel} version=${version} host=${host} cli=${path}\n`)

  await rm(resolve(projectRoot, 'unpackage/dist/dev/mp-weixin'), {
    recursive: true,
    force: true,
  })
  await rm(resolve(projectRoot, '.debug'), {
    recursive: true,
    force: true,
  })

  await hbuilderx.run({
    args: ['project', 'close', '--path', projectAlias.projectPath],
    cwd: projectRoot,
    allowFailure: true,
    stdio: 'inherit',
  })
  await hbuilderx.run({
    args: ['project', 'open', '--path', projectAlias.projectPath],
    cwd: projectRoot,
    stdio: 'inherit',
  })

  // HBuilderX 5.14 在 launch 阶段用绝对路径可能误判根目录项目类型，导入后用项目名更稳定。
  const launch = hbuilderx.spawn({
    args: ['launch', 'mp-weixin', '--project', projectName, '--compile', compileOnly ? 'true' : 'false', '--runtime-log', 'true'],
    cwd: projectRoot,
    stdio: 'inherit',
  })

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void launch.stop(signal)
    })
  }

  let exit
  try {
    exit = await launch.closed
  }
  finally {
    await hbuilderx.run({
      args: ['project', 'close', '--path', projectAlias.projectPath],
      cwd: projectRoot,
      allowFailure: true,
      stdio: 'inherit',
    })
    await projectAlias.cleanup()
  }

  if (exit.code !== 0) {
    throw new Error(`hbuilderx launch mp-weixin failed: ${exit.signal ?? exit.code}`)
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
