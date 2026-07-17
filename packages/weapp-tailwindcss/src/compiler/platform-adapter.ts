import type { IStyleHandlerOptions, StyleHandler } from '@weapp-tailwindcss/postcss/types'
import type { GenerationArtifact, PlatformAdapter, PlatformGenerationRequest } from './types'
import { cloneGenerationArtifact } from './artifact'

export interface CreateStylePlatformAdapterOptions {
  id: PlatformAdapter['id']
  styleHandler: StyleHandler
  styleOptions?: Partial<IStyleHandlerOptions> | undefined
}

export function createPassthroughPlatformAdapter(id: PlatformAdapter['id']): PlatformAdapter {
  return {
    id,
    prepare(request) {
      return {
        ...request,
        candidates: new Set(request.candidates),
        scope: { ...request.scope },
      }
    },
    async transform(artifact) {
      return cloneGenerationArtifact(artifact)
    },
  }
}

export function createStylePlatformAdapter(options: CreateStylePlatformAdapterOptions): PlatformAdapter {
  return {
    id: options.id,
    prepare(request: PlatformGenerationRequest) {
      return {
        ...request,
        candidates: new Set(request.candidates),
        scope: { ...request.scope },
      }
    },
    async transform(artifact: GenerationArtifact, context) {
      const transformed = cloneGenerationArtifact(artifact)
      for (const fragment of transformed.fragments) {
        const result = await options.styleHandler.transformRoot(fragment.root, options.styleOptions)
        fragment.root = result.root.clone()
        fragment.stage = context.stage
      }
      return transformed
    },
  }
}
