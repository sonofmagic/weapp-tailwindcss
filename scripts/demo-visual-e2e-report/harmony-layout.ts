import type { HarmonyRuntimeTextPair } from '../../e2e/hbuilderx-local/cases.ts'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import process from 'node:process'
import { resolveHdcCommand } from '../../e2e/hbuilderx-local/process.ts'

interface HarmonyLayoutNode {
  attributes?: {
    bounds?: string
    text?: string
    type?: string
  }
  children?: HarmonyLayoutNode[]
}

interface HarmonyLayoutBounds {
  height: number
  maxX: number
  maxY: number
  minX: number
  minY: number
  width: number
}

function normalizeLayoutText(value: string | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

export function parseHarmonyLayoutBounds(value: string | undefined): HarmonyLayoutBounds | undefined {
  const match = value?.match(/^\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]$/)
  if (!match) {
    return undefined
  }
  const [, minXSource, minYSource, maxXSource, maxYSource] = match
  const minX = Number(minXSource)
  const minY = Number(minYSource)
  const maxX = Number(maxXSource)
  const maxY = Number(maxYSource)
  return {
    height: maxY - minY,
    maxX,
    maxY,
    minX,
    minY,
    width: maxX - minX,
  }
}

function collectHarmonyLayoutNodes(root: HarmonyLayoutNode) {
  const nodes: HarmonyLayoutNode[] = []
  const visit = (node: HarmonyLayoutNode) => {
    nodes.push(node)
    node.children?.forEach(visit)
  }
  visit(root)
  return nodes
}

export function analyzeHarmonyRuntimeTextPairs(root: HarmonyLayoutNode, pairs: HarmonyRuntimeTextPair[]) {
  const nodes = collectHarmonyLayoutNodes(root)
  return pairs.map((pair) => {
    const tailwindNode = nodes.find(node => normalizeLayoutText(node.attributes?.text) === normalizeLayoutText(pair.tailwindText))
      ?? (pair.tailwindLayoutNodeIndex == null ? undefined : nodes[pair.tailwindLayoutNodeIndex])
    const nativeNode = nodes.find(node => normalizeLayoutText(node.attributes?.text) === normalizeLayoutText(pair.nativeText))
      ?? (pair.nativeLayoutNodeIndex == null ? undefined : nodes[pair.nativeLayoutNodeIndex])
    const tailwindBounds = parseHarmonyLayoutBounds(tailwindNode?.attributes?.bounds)
    const nativeBounds = parseHarmonyLayoutBounds(nativeNode?.attributes?.bounds)
    if (!tailwindBounds || !nativeBounds) {
      throw new Error(`Harmony 布局树缺少 line-height 对照节点：tailwind=${pair.tailwindText} native=${pair.nativeText}`)
    }
    const maxHeightDifference = pair.maxHeightDifference ?? 1
    const heightDifference = Math.abs(tailwindBounds.height - nativeBounds.height)
    if (heightDifference > maxHeightDifference) {
      throw new Error(`Harmony line-height 对照高度不一致：tailwind=${tailwindBounds.height}px native=${nativeBounds.height}px diff=${heightDifference}px`)
    }
    return {
      heightDifference,
      native: {
        bounds: nativeBounds,
        text: normalizeLayoutText(nativeNode?.attributes?.text),
        type: nativeNode?.attributes?.type,
      },
      tailwind: {
        bounds: tailwindBounds,
        text: normalizeLayoutText(tailwindNode?.attributes?.text),
        type: tailwindNode?.attributes?.type,
      },
    }
  })
}

function createHdcArgs(deviceId?: string) {
  return deviceId ? ['-t', deviceId] : []
}

export async function captureAndAnalyzeHarmonyLayout(options: {
  deviceId?: string
  file: string
  pairs: HarmonyRuntimeTextPair[]
  timeoutMs: number
}) {
  const hdc = resolveHdcCommand()
  const baseArgs = createHdcArgs(options.deviceId)
  const remote = `/data/local/tmp/weapp-tailwindcss-layout-${process.pid}-${Date.now()}.json`
  const dump = spawnSync(hdc, [...baseArgs, 'shell', 'uitest', 'dumpLayout', '-p', remote, '-b', 'io.dcloud.uniappx'], {
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    timeout: options.timeoutMs,
  })
  if (dump.status !== 0) {
    throw new Error(`Harmony 布局树采集失败：${dump.stderr || dump.stdout || `exit=${dump.status}`}`)
  }
  const receive = spawnSync(hdc, [...baseArgs, 'file', 'recv', remote, options.file], {
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    timeout: options.timeoutMs,
  })
  spawnSync(hdc, [...baseArgs, 'shell', 'rm', '-f', remote], {
    encoding: 'utf8',
    killSignal: 'SIGTERM',
    timeout: options.timeoutMs,
  })
  if (receive.status !== 0) {
    throw new Error(`Harmony 布局树拉取失败：${receive.stderr || receive.stdout || `exit=${receive.status}`}`)
  }
  const root = JSON.parse(await fs.readFile(options.file, 'utf8')) as HarmonyLayoutNode
  return {
    file: options.file,
    pairs: analyzeHarmonyRuntimeTextPairs(root, options.pairs),
  }
}
