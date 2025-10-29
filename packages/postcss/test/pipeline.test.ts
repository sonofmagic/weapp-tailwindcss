import type { IStyleHandlerOptions } from '@/types'
import { describe, expect, it } from 'vitest'
import { createStyleHandler } from '@/handler'
import { createStylePipeline } from '@/pipeline'

function createOptions(partial: Partial<IStyleHandlerOptions>): IStyleHandlerOptions {
  return {
    cssPresetEnv: {
      features: {},
      autoprefixer: { add: false },
    },
    ...partial,
  } as IStyleHandlerOptions
}

describe('style processing pipeline', () => {
  it('links nodes with stage-aware context', () => {
    const options = createOptions({
      px2rpx: true,
      rem2rpx: true,
      cssCalc: {
        includeCustomProperties: [/^--tw-/],
      },
    })

    const pipeline = createStylePipeline(options)
    const ids = pipeline.nodes.map(node => node.id)
    expect(ids).toEqual([
      'pre:core',
      'normal:preset-env',
      'normal:px-transform',
      'normal:rem-transform',
      'normal:calc',
      'normal:custom-property-cleaner',
      'post:core',
    ])

    pipeline.nodes.forEach((node, index, allNodes) => {
      expect(node.context.index).toBe(index)
      expect(node.context.size).toBe(allNodes.length)

      const previous = index > 0 ? allNodes[index - 1] : undefined
      const next = index < allNodes.length - 1 ? allNodes[index + 1] : undefined

      expect(node.context.previous).toEqual(previous && { id: previous.id, stage: previous.stage })
      expect(node.context.next).toEqual(next && { id: next.id, stage: next.stage })

      const seenInStage = allNodes.slice(0, index).filter(item => item.stage === node.stage).length
      expect(node.context.stageIndex).toBe(seenInStage)

      const totalInStage = allNodes.filter(item => item.stage === node.stage).length
      expect(node.context.stageSize).toBe(totalInStage)
    })
  })

  it('includes user plugins inside the pre stage', () => {
    const userPlugin = { postcssPlugin: 'user-plugin' }
    const options = createOptions({
      postcssOptions: {
        plugins: [userPlugin],
      },
      cssCalc: false,
      px2rpx: false,
      rem2rpx: false,
    })

    const pipeline = createStylePipeline(options)
    const ids = pipeline.nodes.map(node => node.id)
    expect(ids).toEqual([
      'pre:user-0',
      'pre:core',
      'normal:preset-env',
      'post:core',
    ])

    const [userNode, preNode] = pipeline.nodes
    expect(userNode.stage).toBe('pre')
    expect(preNode.stage).toBe('pre')
    expect(userNode.context.stageSize).toBe(2)
    expect(preNode.context.stageIndex).toBe(1)
  })

  it('exposes cached pipeline through the style handler API', () => {
    const handler = createStyleHandler({
      cssPresetEnv: {
        features: {},
        autoprefixer: { add: false },
      },
    })

    const basePipeline = handler.getPipeline()
    expect(basePipeline.nodes[0]?.stage).toBe('pre')

    const overridePipeline = handler.getPipeline({
      px2rpx: true,
      cssCalc: {
        includeCustomProperties: [/^--tw-/],
      },
    })

    expect(overridePipeline.nodes.some(node => node.id === 'normal:px-transform')).toBe(true)
    expect(overridePipeline.nodes.some(node => node.id === 'normal:custom-property-cleaner')).toBe(true)
  })
})
