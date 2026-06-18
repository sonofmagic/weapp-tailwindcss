import type { TailwindcssBranchVersion } from './types'

export function resolveTailwindcssBranchVersion(majorVersion: number | undefined): TailwindcssBranchVersion {
  return majorVersion === 4 ? 4 : 3
}
