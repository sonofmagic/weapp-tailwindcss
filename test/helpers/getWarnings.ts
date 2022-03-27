import normalizeErrors from './normalizeErrors'
import type { Stats } from 'webpack'
export default (stats: Stats) => normalizeErrors(stats.compilation.warnings).sort()
