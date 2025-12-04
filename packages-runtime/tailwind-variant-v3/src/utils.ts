export function falsyToString<T>(value: T): T | string {
  return typeof value === 'boolean' ? `${value}` : value === 0 ? '0' : value
}

export function isEmptyObject(obj: unknown): obj is Record<string, never> {
  return !obj || typeof obj !== 'object' || Object.keys(obj).length === 0
}

export function isEqual(obj1: object, obj2: object): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function flat(arr: unknown[], target: unknown[]): void {
  arr.forEach((el) => {
    if (Array.isArray(el)) {
      flat(el, target)
    }
    else {
      target.push(el)
    }
  })
}

export function flatArray(arr: unknown[]): unknown[] {
  const flattened: unknown[] = []

  flat(arr, flattened)

  return flattened
}

export function flatMergeArrays(...arrays: unknown[]): unknown[] {
  return flatArray(arrays).filter(Boolean)
}

export function mergeObjects(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = {}
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  for (const key of keys1) {
    if (keys2.includes(key)) {
      const val1 = obj1[key]
      const val2 = obj2[key]

      if (Array.isArray(val1) || Array.isArray(val2)) {
        result[key] = flatMergeArrays(val2, val1)
      }
      else if (typeof val1 === 'object' && typeof val2 === 'object') {
        result[key] = mergeObjects(val1 as Record<string, any>, val2 as Record<string, any>)
      }
      else {
        result[key] = `${val2} ${val1}`
      }
    }
    else {
      result[key] = obj1[key]
    }
  }

  for (const key of keys2) {
    if (!keys1.includes(key)) {
      result[key] = obj2[key]
    }
  }

  return result
}

export function removeExtraSpaces(str: string | undefined): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str.replace(/\s+/g, ' ').trim()
}
