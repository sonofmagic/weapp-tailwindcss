export interface UserDefinedOptions {
  classNameRegExp?: string
  reserveClassName?: string[]
  ignorePrefix?: string[]
  ignorePrefixRegExp?: string[]
  classGenerator?: (
    original: string,
    opts: UserDefinedOptions,
    context: Record<string, any>
  ) => string
  log?: boolean
}
