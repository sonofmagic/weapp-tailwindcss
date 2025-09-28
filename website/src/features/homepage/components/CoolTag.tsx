import type { FC, PropsWithChildren } from 'react'
import { cn } from '../../../utils/cn'

export interface CoolTagProps extends PropsWithChildren {
  className?: string
}

export const CoolTag: FC<CoolTagProps> = ({ children, className }) => {
  return (
    <div className={cn('group relative px-1.5 text-sm/6 text-sky-800 dark:text-sky-300', className)}>
      <span className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 transition-colors duration-300 group-hover:bg-sky-400/15 dark:border-sky-300/30"></span>
      {children}
      <svg width="5" height="5" viewBox="0 0 5 5" className="absolute left-[-2px] top-[-2px] fill-sky-300 dark:fill-sky-300/50">
        <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
      </svg>
      <svg width="5" height="5" viewBox="0 0 5 5" className="absolute right-[-2px] top-[-2px] fill-sky-300 dark:fill-sky-300/50">
        <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
      </svg>
      <svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] left-[-2px] fill-sky-300 dark:fill-sky-300/50">
        <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
      </svg>
      <svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] right-[-2px] fill-sky-300 dark:fill-sky-300/50">
        <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
      </svg>
    </div>
  )
}
