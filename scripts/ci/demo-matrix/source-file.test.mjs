import { watch } from 'node:fs'
import { chmod, mkdtemp, readdir, readFile, realpath, rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { expect, it } from 'vitest'
import { replaceSourceFile } from './source-file.mjs'

it('publishes complete source revisions to a real watcher across consecutive replacements', async () => {
  const dir = await realpath(await mkdtemp(path.join(os.tmpdir(), 'demo-source-')))
  const file = path.join(dir, 'entry.vue')
  const revisions = Array.from({ length: 5 }, (_, round) => `<template>${String(round).repeat(2 ** 21)}</template>`)
  const reads = []
  let watcher
  try {
    await replaceSourceFile(file, revisions[0])
    await chmod(file, 0o644)
    watcher = watch(dir, (_, name) => {
      if (name === path.basename(file)) {
        reads.push(readFile(file, 'utf8'))
      }
    })
    for (const revision of revisions.slice(1)) {
      const offset = reads.length
      await replaceSourceFile(file, revision)
      await expect.poll(async () => (await Promise.all(reads.slice(offset))).includes(revision)).toBe(true)
    }
    watcher.close()
    expect(reads.length).toBeGreaterThanOrEqual(revisions.length - 1)
    for (const observed of await Promise.all(reads)) {
      expect(revisions.includes(observed)).toBe(true)
    }
    expect(await readFile(file, 'utf8')).toBe(revisions.at(-1))
    expect(await readdir(dir)).toEqual(['entry.vue'])
    if (process.platform !== 'win32') {
      expect((await stat(file)).mode & 0o777).toBe(0o644)
    }
  }
  finally {
    watcher?.close()
    await rm(dir, { recursive: true, force: true })
  }
})
