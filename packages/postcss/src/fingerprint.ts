interface FingerprintState {
  map: WeakMap<object, string>
  counter: number
}

export function fingerprintOptions(
  value: unknown,
  state: FingerprintState = { map: new WeakMap<object, string>(), counter: 0 },
): string {
  if (value === null || value === undefined) {
    return String(value)
  }

  if (typeof value === 'function') {
    return `fn:${value.name || 'anonymous'}`
  }
  if (typeof value === 'symbol') {
    return `sym:${String(value)}`
  }
  if (typeof value !== 'object') {
    return `${typeof value}:${String(value)}`
  }

  const objectValue = value as Record<string, unknown>
  const cached = state.map.get(objectValue)
  if (cached) {
    return cached
  }

  const marker = `ref:${state.counter++}`
  state.map.set(objectValue, marker)

  if (Array.isArray(objectValue)) {
    const parts = objectValue.map(entry => fingerprintOptions(entry, state))
    return `[${parts.join(',')}]`
  }

  const keys = Object.keys(objectValue).sort()
  const parts = keys.map(key => `${key}:${fingerprintOptions(objectValue[key], state)}`)
  return `{${parts.join(',')}}@${marker}`
}
