import { describe, expect, it } from 'vitest'
import { getGeneratorSourceMetadata } from '@/bundlers/shared/generator-css/source-resolver'
import { withGeneratorSourceMetadata } from '@/bundlers/shared/generator-css/source-resolver/metadata'

describe('generator source metadata', () => {
  it('survives source cloning without exposing string metadata fields', () => {
    const source = withGeneratorSourceMetadata({
      base: '/workspace',
      baseFallbacks: [],
      css: '@import "tailwindcss";',
      dependencies: [],
      projectRoot: '/workspace',
    } as any, {
      matchedCssSourceFile: '/workspace/src/app.css',
      primaryCssSource: true,
    })
    const cloned = {
      ...source,
      css: '@import "tailwindcss/utilities";',
    }

    expect(getGeneratorSourceMetadata(cloned)).toEqual({
      matchedCssSourceFile: '/workspace/src/app.css',
      primaryCssSource: true,
    })
    expect(Object.keys(cloned)).not.toContain('__weappTailwindcssMeta')
    expect(JSON.stringify(cloned)).not.toContain('matchedCssSourceFile')
  })

  it('reads legacy metadata from compatibility sources', () => {
    expect(getGeneratorSourceMetadata({
      __weappTailwindcssMeta: {
        matchedCssSourceFile: '/workspace/src/legacy.css',
      },
    } as any)).toEqual({
      matchedCssSourceFile: '/workspace/src/legacy.css',
    })
  })
})
