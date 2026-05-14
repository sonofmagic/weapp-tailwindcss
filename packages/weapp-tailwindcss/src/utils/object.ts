type DefinedEntry<T extends object> = {
  [K in keyof T]: undefined extends T[K]
    ? [K, Exclude<T[K], undefined>]
    : [K, T[K]]
}[keyof T]

export type UndefinedOptional<T extends object> = {
  [K in keyof T]?: T[K] | undefined
}

export function definedEntries<T extends object>(value: UndefinedOptional<T>): DefinedEntry<T>[] {
  return Object.entries(value).filter(([, item]) => item !== undefined) as DefinedEntry<T>[]
}

export function omitUndefined<T extends object>(value: UndefinedOptional<T>): Partial<T> {
  return Object.fromEntries(definedEntries<T>(value)) as Partial<T>
}
