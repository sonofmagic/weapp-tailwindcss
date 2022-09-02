import type { IMangleContextClass } from '@/types'

export interface IClassGenerator {
  newClassMap: Record<string, IMangleContextClass>
  newClassSize: number
}
