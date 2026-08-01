import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { benchmarkProjects } from './projects.mjs'

export const pullRequestBenchmarkKeys = [
  'demo-weapp-vite-tailwindcss-v4__mp-weixin',
  'demo-taro-vite-react-tailwindcss-v4__mp-weixin',
  'demo-taro-webpack-react-tailwindcss-v4__mp-weixin',
  'demo-uni-app-vite-tailwindcss-v4__mp-weixin',
  'demo-mpx-tailwindcss-v4__mp-weixin',
]

function parseArg(name, fallback = '') {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : (process.argv[index + 1] ?? fallback)
}

function parseOnly(value) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function toCaseName(project) {
  return project
    .replaceAll(/[^a-z0-9]+/gi, '-')
    .replaceAll(/^-|-$/g, '')
}

export function createBenchmarkShards({ eventName = 'push', only = '' } = {}) {
  const requestedKeys = eventName === 'pull_request'
    ? pullRequestBenchmarkKeys
    : parseOnly(only)
  const selectedKeys = requestedKeys.length > 0
    ? requestedKeys
    : benchmarkProjects.map(project => project.key)
  const knownKeys = new Set(benchmarkProjects.map(project => project.key))
  const unknownKeys = selectedKeys.filter(key => !knownKeys.has(key))
  if (unknownKeys.length > 0) {
    throw new Error(`unknown benchmark project key(s): ${unknownKeys.join(', ')}`)
  }

  const selectedKeySet = new Set(selectedKeys)
  const grouped = new Map()
  for (const project of benchmarkProjects) {
    if (!selectedKeySet.has(project.key)) {
      continue
    }
    const keys = grouped.get(project.project) ?? []
    keys.push(project.key)
    grouped.set(project.project, keys)
  }

  return Array.from(grouped, ([project, keys]) => ({
    case_name: toCaseName(project),
    bench_only: keys.join(','),
  }))
}

async function main() {
  const shards = createBenchmarkShards({
    eventName: parseArg('--event', process.env.GITHUB_EVENT_NAME ?? 'push'),
    only: parseArg('--only', ''),
  })
  process.stdout.write(JSON.stringify(shards))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
