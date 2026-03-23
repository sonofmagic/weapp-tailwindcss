import { createRequire } from 'node:module'
import { createTsupConfigs } from './tsup.shared'

const require = createRequire(__filename)
// Use require so TS doesn't resolve tsup's broken './types.cts' import during type-checking
const { defineConfig } = require('tsup') as { defineConfig: (...args: any[]) => any }

export default defineConfig((options = {}) => createTsupConfigs(options))
