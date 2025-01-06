import { createTailwindMerge } from 'tailwind-merge'
import { getDefaultConfig } from './default-config'

export const cn = createTailwindMerge(getDefaultConfig)
