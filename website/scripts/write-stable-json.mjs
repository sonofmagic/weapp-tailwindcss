import fs from 'node:fs'
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

function readExistingJson(file) {
  if (!fs.existsSync(file)) {
    return null
  }

  try {
    const raw = fs.readFileSync(file, 'utf8')
    return {
      raw,
      parsed: JSON.parse(raw),
    }
  }
  catch {
    return null
  }
}

export function writeStableJson(file, payload, options = {}) {
  const volatileKeys = new Set(options.volatileKeys ?? ['generatedAt'])
  const existing = readExistingJson(file)

  if (existing) {
    const previousNormalized = normalizePayload(existing.parsed, volatileKeys)
    const nextNormalized = normalizePayload(payload, volatileKeys)
    if (JSON.stringify(previousNormalized) === JSON.stringify(nextNormalized)) {
      return false
    }
  }

  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return true
}
