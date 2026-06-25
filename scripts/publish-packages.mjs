import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { argv, cwd, env, exit, stderr, stdout } from 'node:process'

const prereleaseTags = new Set(['alpha', 'beta', 'rc', 'next'])
const transientChangesetVersionErrorPatterns = [
  /Failed to parse data from GitHub/i,
  /Invalid response body/i,
  /Premature close/i,
  /ECONNRESET/i,
  /ETIMEDOUT/i,
  /EAI_AGAIN/i,
  /fetch failed/i,
  /socket hang up/i,
]

function parseArgs(args) {
  const options = {
    branch: env.RELEASE_BRANCH || env.GITHUB_REF_NAME,
    dryRun: false,
    phase: 'publish',
  }

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (arg === '--') {
      continue
    }

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--branch') {
      const branch = args[index + 1]
      if (!branch) {
        throw new Error('缺少 --branch 参数值')
      }
      options.branch = branch
      index++
      continue
    }

    if (arg === '--phase') {
      const phase = args[index + 1]
      if (phase !== 'version' && phase !== 'publish') {
        throw new Error('--phase 只能是 version 或 publish')
      }
      options.phase = phase
      index++
      continue
    }

    throw new Error(`未知参数：${arg}`)
  }

  return options
}

function commandToText(command, args) {
  return [command, ...args].join(' ')
}

function run(command, args, options) {
  const text = commandToText(command, args)

  if (options.dryRun) {
    console.log(`[dry-run] ${text}`)
    return
  }

  console.log(`$ ${text}`)
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    exit(result.status ?? 1)
  }
}

function runWithRetry(command, args, options, retryOptions) {
  const text = commandToText(command, args)
  const retries = retryOptions.retries ?? 0

  if (options.dryRun) {
    console.log(`[dry-run] retry ${retries} ${text}`)
    run(command, args, options)
    return
  }

  let lastStatus = 1
  for (let attempt = 0; attempt <= retries; attempt++) {
    console.log(`$ ${text}${attempt > 0 ? ` (retry ${attempt}/${retries})` : ''}`)
    const result = spawnSync(command, args, {
      encoding: 'utf8',
      env,
    })

    if (result.stdout) {
      stdout.write(result.stdout)
    }
    if (result.stderr) {
      stderr.write(result.stderr)
    }
    if (result.error) {
      throw result.error
    }
    if (result.status === 0) {
      return
    }

    lastStatus = result.status ?? 1
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
    const canRetry = attempt < retries && retryOptions.shouldRetry(output, lastStatus)
    if (!canRetry) {
      exit(lastStatus)
    }

    console.warn(`changeset version 遇到临时错误，准备重试 (${attempt + 1}/${retries})`)
  }

  exit(lastStatus)
}

function shouldRetryChangesetVersion(output) {
  return transientChangesetVersionErrorPatterns.some(pattern => pattern.test(output))
}

function runChangesetVersion(options) {
  runWithRetry('pnpm', ['changeset', 'version'], options, {
    retries: 2,
    shouldRetry: output => shouldRetryChangesetVersion(output),
  })
}

function getCurrentBranch(options) {
  if (options.branch) {
    return options.branch
  }

  const result = spawnSync('git', ['branch', '--show-current'], {
    encoding: 'utf8',
  })

  if (result.error) {
    throw result.error
  }

  const branch = result.stdout.trim()
  if (!branch) {
    throw new Error('无法识别当前发布分支，请设置 RELEASE_BRANCH 或 GITHUB_REF_NAME')
  }

  return branch
}

function getPreState() {
  const preStatePath = resolve(cwd(), '.changeset', 'pre.json')

  if (!existsSync(preStatePath)) {
    return
  }

  return JSON.parse(readFileSync(preStatePath, 'utf8'))
}

function enterPreMode(tag, options) {
  const preState = getPreState()

  if (preState?.mode === 'pre') {
    if (preState.tag !== tag) {
      throw new Error(`当前 changeset pre tag 为 ${preState.tag}，不能发布 ${tag} 预发布包`)
    }

    console.log(`changeset 已处于 ${tag} pre mode`)
    return
  }

  run('pnpm', ['changeset', 'pre', 'enter', tag], options)
}

function publishLatest(options) {
  if (options.phase === 'version') {
    runChangesetVersion(options)
    return
  }

  run('pnpm', ['build'], options)
  run('pnpm', ['test:release'], options)
  run('pnpm', ['changeset', 'publish'], options)
}

function publishPrerelease(tag, options) {
  if (options.phase === 'version') {
    enterPreMode(tag, options)
    runChangesetVersion(options)
    return
  }

  run('pnpm', ['build'], options)
  run('pnpm', ['test:release'], options)

  const preState = getPreState()
  if (preState?.mode === 'pre') {
    if (preState.tag !== tag) {
      throw new Error(`当前 changeset pre tag 为 ${preState.tag}，不能发布 ${tag} 预发布包`)
    }

    run('pnpm', ['changeset', 'pre', 'exit'], options)
  }

  run('pnpm', ['changeset', 'publish', '--tag', tag], options)
}

const options = parseArgs(argv.slice(2))
const branch = getCurrentBranch(options)

if (branch === 'main') {
  publishLatest(options)
}
else if (prereleaseTags.has(branch)) {
  publishPrerelease(branch, options)
}
else {
  throw new Error(`分支 ${branch} 不允许执行发布，请切换到 main/alpha/beta/rc/next`)
}
