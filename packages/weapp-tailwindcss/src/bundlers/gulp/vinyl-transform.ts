import type File from 'vinyl'
import path from 'node:path'
import stream from 'node:stream'
import { emitHmrTiming } from '../shared/hmr-timing'

const Transform = stream.Transform

export function createVinylTransform(
  phase: string,
  handler: (file: File) => Promise<void>,
  getTimingDetails?: ((file: File) => Record<string, unknown> | undefined) | undefined,
) {
  return new Transform({
    objectMode: true,
    async transform(file: File, _encoding, callback) {
      const hmrTimingStartedAt = performance.now()
      try {
        await handler(file)
        emitHmrTiming('gulp', phase, performance.now() - hmrTimingStartedAt, {
          file: file.relative || path.basename(file.path),
          ...getTimingDetails?.(file),
        })
        callback(null, file)
      }
      catch (error) {
        callback(error as Error, file)
      }
    },
  })
}
