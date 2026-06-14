import process from 'node:process'
import { createContext } from 'weapp-tailwindcss/core'
import { createDemoRuntimeSet } from './index'

const tailwindConfig = new URL('../tailwind.config.cjs', import.meta.url).pathname

export interface MemorySample {
  heapUsedMb: number
  iteration: number
  rssMb: number
}

export interface MemoryResult {
  deltaHeapUsedMb: number
  first: MemorySample
  last: MemorySample
  maxHeapUsedMb: number
  samples: MemorySample[]
}

function toMb(bytes: number) {
  return Math.round(bytes / 1024 / 1024)
}

function sampleMemory(iteration: number): MemorySample {
  globalThis.gc?.()
  const memory = process.memoryUsage()
  return {
    heapUsedMb: toMb(memory.heapUsed),
    iteration,
    rssMb: toMb(memory.rss),
  }
}

function createSources(iteration: number) {
  const runtimeSet = createDemoRuntimeSet()
  runtimeSet.add(`text-[${20 + iteration}px]`)
  runtimeSet.add(`bg-[#${String(iteration).padStart(6, '0')}]`)

  return {
    js: `const classes = ["mb-[1.5rem]", "text-[${20 + iteration}px]", "bg-[#${String(iteration).padStart(6, '0')}]"]`,
    runtimeSet,
    wxml: `<view class="mt-[8px] text-[${20 + iteration}px] bg-[#${String(iteration).padStart(6, '0')}]"></view>`,
    wxss: [
      `.text-\\[${20 + iteration}px\\] { font-size: ${20 + iteration}px; }`,
      `.bg-\\[\\#${String(iteration).padStart(6, '0')}\\] { background-color: #${String(iteration).padStart(6, '0')}; }`,
      '.mt-\\[8px\\] { margin-top: 8px; }',
    ].join('\n'),
  }
}

export async function runMemoryDemo(options: {
  heapBudgetMb?: number
  iterations?: number
} = {}): Promise<MemoryResult> {
  const iterations = options.iterations ?? 160
  const heapBudgetMb = options.heapBudgetMb ?? 96
  const ctx = createContext({
    appType: 'native',
    tailwindcss: {
      config: tailwindConfig,
    },
  })
  const samples: MemorySample[] = []

  samples.push(sampleMemory(0))
  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    const source = createSources(iteration)
    await ctx.transformWxml(source.wxml, { runtimeSet: source.runtimeSet })
    await ctx.transformJs(source.js, { runtimeSet: source.runtimeSet })
    await ctx.transformWxss(source.wxss, { isMainChunk: true })
    if (iteration % 20 === 0) {
      samples.push(sampleMemory(iteration))
    }
  }
  samples.push(sampleMemory(iterations))

  const first = samples[0]!
  const last = samples[samples.length - 1]!
  const maxHeapUsedMb = Math.max(...samples.map(sample => sample.heapUsedMb))
  const deltaHeapUsedMb = maxHeapUsedMb - first.heapUsedMb
  if (typeof globalThis.gc === 'function' && deltaHeapUsedMb > heapBudgetMb) {
    throw new Error(`Node API createContext heap 增长超出预算: ${deltaHeapUsedMb}MB > ${heapBudgetMb}MB`)
  }

  return {
    deltaHeapUsedMb,
    first,
    last,
    maxHeapUsedMb,
    samples,
  }
}

async function main() {
  const result = await runMemoryDemo()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main()
}
