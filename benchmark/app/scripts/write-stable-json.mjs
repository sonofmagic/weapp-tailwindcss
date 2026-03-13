import { promises as fs } from 'node:fs'
import path from 'node:path'

function normalizePayload(value, volatileKeys) {
  if (Array.isArray(value)) {
    return value.map(item => normalizePayload(item, volatileKeys))
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([key]) => !volatileKeys.has(key))
      .map(([key, item]) => [key, normalizePayload(item, volatileKeys)])
      .sort(([left], [right]) => left.localeCompare(right))
    return Object.fromEntries(entries)
  }

  return value
}

async function readExistingJson(file) {
  try {
    const raw = await fs.readFile(file, 'utf8')
    return {
      parsed: JSON.parse(raw),
    }
  }
  catch {
    return null
  }
}

export async function writeStableJson(file, payload, volatileKeys = ['generatedAt']) {
  const existing = await readExistingJson(file)
  const volatileKeySet = new Set(volatileKeys)

  if (existing) {
    const previousNormalized = normalizePayload(existing.parsed, volatileKeySet)
    const nextNormalized = normalizePayload(payload, volatileKeySet)
    if (JSON.stringify(previousNormalized) === JSON.stringify(nextNormalized)) {
      return false
    }
  }

  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return true
}
