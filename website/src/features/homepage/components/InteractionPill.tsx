import type { FC, ReactNode } from 'react'
import Link from '@docusaurus/Link'
import { interactionPill, interactionPillIcon, interactionPillLabel, interactionPillLink } from '../variants'

export interface InteractionPillProps {
  href: string
  label: string
  icon?: ReactNode
}

export const InteractionPill: FC<InteractionPillProps> = ({ href, label, icon = '🚀' }) => {
  return (
    <div className={interactionPill()}>
      <Link className={interactionPillLink()} to={href}>
        <span className={interactionPillIcon()}>{icon}</span>
        <span className={interactionPillLabel()}>{label}</span>
        <svg
          aria-hidden="true"
          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  )
}
