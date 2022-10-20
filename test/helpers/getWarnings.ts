import normalizeErrors from './normalizeErrors'
import type { Stats } from './types'
export default (stats: Stats) => normalizeErrors(stats.compilation.warnings).sort()
