import type { OutputIntegrityGuard } from './types'
import { Buffer } from 'node:buffer'
import { unwatchFile, watchFile } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { formatPath } from './cli'

const OUTPUT_INTEGRITY_CONFIRMATION_MS = 10

interface OutputIntegrityViolation {
  bytes: number
  excerpt: string
  file: string
  forbiddenFragment: string
  observedAt: number
}

export function createOutputIntegrityMonitor(guards: OutputIntegrityGuard[] | undefined) {
  if (!guards || guards.length === 0) {
    return undefined
  }

  const violations = new Map<string, OutputIntegrityViolation>()
  let pendingInspection = Promise.resolve()
  const inspect = async (guard: OutputIntegrityGuard) => {
    const content = await readFile(guard.file, 'utf8').catch(() => undefined)
    if (content === undefined) {
      return
    }
    const matchedFragments = guard.forbiddenFragments.filter(forbiddenFragment => content.includes(forbiddenFragment))
    if (matchedFragments.length === 0) {
      return
    }
    await delay(OUTPUT_INTEGRITY_CONFIRMATION_MS)
    const confirmedContent = await readFile(guard.file, 'utf8').catch(() => undefined)
    if (confirmedContent === undefined) {
      return
    }
    for (const forbiddenFragment of matchedFragments) {
      if (!confirmedContent.includes(forbiddenFragment)) {
        continue
      }
      const key = `${guard.file}\0${forbiddenFragment}`
      const fragmentIndex = confirmedContent.indexOf(forbiddenFragment)
      violations.set(key, {
        bytes: Buffer.byteLength(confirmedContent),
        excerpt: confirmedContent.slice(
          Math.max(0, fragmentIndex - 80),
          Math.min(confirmedContent.length, fragmentIndex + forbiddenFragment.length + 160),
        ),
        file: guard.file,
        forbiddenFragment,
        observedAt: Date.now(),
      })
    }
  }
  const queueInspection = (guard: OutputIntegrityGuard) => {
    pendingInspection = pendingInspection
      .then(() => inspect(guard))
      .catch(() => {})
  }

  for (const guard of guards) {
    watchFile(guard.file, {
      interval: 10,
      persistent: false,
    }, () => queueInspection(guard))
    queueInspection(guard)
  }

  const createError = (phase: string) => {
    const violation = violations.values().next().value as OutputIntegrityViolation | undefined
    if (!violation) {
      return undefined
    }
    return new Error(
      `output integrity violation during ${phase}: ${formatPath(violation.file)} contained ${JSON.stringify(violation.forbiddenFragment)} at ${new Date(violation.observedAt).toISOString()} bytes=${violation.bytes} excerpt=${JSON.stringify(violation.excerpt)}`,
    )
  }

  return {
    async assertClean(phase: string) {
      await pendingInspection
      const error = createError(phase)
      if (error) {
        throw error
      }
    },
    async stop() {
      for (const guard of guards) {
        unwatchFile(guard.file)
        queueInspection(guard)
      }
      await pendingInspection
    },
  }
}
