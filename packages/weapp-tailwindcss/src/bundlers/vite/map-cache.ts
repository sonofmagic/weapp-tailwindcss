export function touchMapEntry<Key, Value>(map: Map<Key, Value>, key: Key, value: Value) {
  map.delete(key)
  map.set(key, value)
}

export function pruneMapToMaxSize<Key, Value>(
  map: Map<Key, Value>,
  maxSize: number,
  onDelete?: (key: Key) => void,
) {
  while (map.size > maxSize) {
    const key = map.keys().next().value
    if (key === undefined) {
      break
    }
    map.delete(key)
    onDelete?.(key)
  }
}
