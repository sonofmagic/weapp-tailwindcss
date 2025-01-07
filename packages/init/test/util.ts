import type { FetchOptions } from 'npm-registry-fetch'
import { resolve } from 'pathe'

export const npmmirrorRegistry = 'https://registry.npmmirror.com'

export const fetchOptions: FetchOptions = {
  registry: npmmirrorRegistry,
}

export const fixturesRootPath = resolve(__dirname, 'fixtures')
