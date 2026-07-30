import type { HmrSourceMutation } from './cases'

import fs from 'node:fs/promises'
import path from 'pathe'

import { readUtf8 } from './process'

export type HmrOutputSnapshot = Map<string, number>

export async function appendHmrSourceMutation(projectRoot: string, mutation: HmrSourceMutation) {
  const file = path.resolve(projectRoot, mutation.file)
  const source = await readUtf8(file)
  const separator = source.endsWith('\n') ? '' : '\n'
  await fs.writeFile(file, `${source}${separator}${mutation.append.trimEnd()}\n`, 'utf8')
  return file
}

export async function createHmrSourceRestore(files: Iterable<string>) {
  const originals = new Map<string, string>()
  for (const file of new Set(files)) {
    originals.set(file, await readUtf8(file))
  }
  return async () => {
    await Promise.all([...originals].map(([file, source]) => fs.writeFile(file, source, 'utf8')))
  }
}

export async function createHmrOutputSnapshot(files: Iterable<string>): Promise<HmrOutputSnapshot> {
  return new Map(await Promise.all([...new Set(files)].map(async file => [
    file,
    (await fs.stat(file)).mtimeMs,
  ] as const)))
}

export async function haveHmrOutputsChanged(snapshot: HmrOutputSnapshot) {
  return (await Promise.all([...snapshot].map(async ([file, previousMtime]) => {
    return (await fs.stat(file)).mtimeMs > previousMtime
  }))).every(Boolean)
}
