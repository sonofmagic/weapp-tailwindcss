import { spawn } from 'node:child_process'
import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { createHBuilderXProjectAlias } from './hbuilderx-project-alias.mjs'

function runPnpm(args, options = {}) {
  const child = spawn('pnpm', args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  })

  return new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      if (options.allowFailure) {
        resolve()
        return
      }
      reject(new Error(`pnpm ${args.join(' ')} failed: ${signal ?? code}`))
    })
  })
}

function spawnPnpm(args) {
  return spawn('pnpm', args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

async function main() {
  const projectRoot = process.cwd()
  const compileOnly = process.env.HBUILDERX_COMPILE_ONLY === '1'
  const projectAlias = await createHBuilderXProjectAlias(projectRoot)
  const projectName = process.env.HBUILDERX_PROJECT_NAME || projectAlias.projectName
  await rm(resolve(projectRoot, 'unpackage/dist/dev/mp-weixin'), {
    recursive: true,
    force: true,
  })
  await rm(resolve(projectRoot, '.debug'), {
    recursive: true,
    force: true,
  })

  await runPnpm(['exec', 'hbuilderx', 'project', 'close', '--path', projectAlias.projectPath], {
    allowFailure: true,
  })
  await runPnpm(['exec', 'hbuilderx', 'project', 'open', '--path', projectAlias.projectPath])

  // HBuilderX 5.14 在 launch 阶段用绝对路径可能误判根目录项目类型，导入后用项目名更稳定。
  const child = spawnPnpm(['exec', 'hbuilderx', 'launch', 'mp-weixin', '--project', projectName, '--compile', compileOnly ? 'true' : 'false', '--runtime-log', 'true'])

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      child.kill(signal)
    })
  }

  let exit
  try {
    exit = await new Promise((resolve, reject) => {
      child.on('error', reject)
      child.on('close', (code, signal) => {
        resolve({ code, signal })
      })
    })
  }
  finally {
    await runPnpm(['exec', 'hbuilderx', 'project', 'close', '--path', projectAlias.projectPath], {
      allowFailure: true,
    })
    await projectAlias.cleanup()
  }

  if (exit.code && exit.code !== 0) {
    throw new Error(`hbuilderx launch mp-weixin failed: ${exit.signal ?? exit.code}`)
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
