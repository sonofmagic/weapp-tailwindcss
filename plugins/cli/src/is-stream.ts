// @ts-nocheck
import type {
  Duplex as DuplexStream,
  Readable as ReadableStream,
  Stream,
  Transform as TransformStream,
  Writable as WritableStream,
} from 'node:stream'

export interface Options {
  /**
   * When this option is `true`, the method returns `false` if the stream has already been closed.
   *
   * @default true
   */
  checkOpen?: boolean
}

export function isStream(stream: any, { checkOpen = true }: Options = {}): stream is Stream {
  return stream !== null
    && typeof stream === 'object'
    && (stream.writable || stream.readable || !checkOpen || (stream.writable === undefined && stream.readable === undefined))
    && typeof stream.pipe === 'function'
}

export function isWritableStream(stream: any, { checkOpen = true }: Options = {}): stream is WritableStream {
  return isStream(stream, { checkOpen })
    && (stream.writable || !checkOpen)
    && typeof stream.write === 'function'
    && typeof stream.end === 'function'
    && typeof stream.writable === 'boolean'
    && typeof stream.writableObjectMode === 'boolean'
    && typeof stream.destroy === 'function'
    && typeof stream.destroyed === 'boolean'
}

export function isReadableStream(stream: any, { checkOpen = true }: Options = {}): stream is ReadableStream {
  return isStream(stream, { checkOpen })
    && (stream.readable || !checkOpen)
    && typeof stream.read === 'function'
    && typeof stream.readable === 'boolean'
    && typeof stream.readableObjectMode === 'boolean'
    && typeof stream.destroy === 'function'
    && typeof stream.destroyed === 'boolean'
}

export function isDuplexStream(stream: any, options?: Options): stream is DuplexStream {
  return isWritableStream(stream, options)
    && isReadableStream(stream, options)
}

export function isTransformStream(stream: any, options?: Options): stream is TransformStream {
  return isDuplexStream(stream, options)
    && typeof stream._transform === 'function'
}
