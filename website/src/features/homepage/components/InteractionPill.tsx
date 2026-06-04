import type { FC, ReactNode } from 'react'
import Link from '@docusaurus/Link'
import { interactionPill, interactionPillIcon, interactionPillLabel, interactionPillLink } from '../variants'

export interface InteractionPillProps {
  className?: string
  href: string
  label: string
  icon?: ReactNode
}

export const InteractionPill: FC<InteractionPillProps> = ({ className, href, label, icon }) => {
  return (
    <div className={[interactionPill(), className ?? ''].filter(Boolean).join(' ')}>
      <Link className={interactionPillLink()} to={href}>
        <span className={interactionPillIcon()}>
          {icon ?? <i aria-hidden="true" className="icon-[mdi--arrow-right] text-[18px]"></i>}
        </span>
        <span className={interactionPillLabel()}>{label}</span>
        <i
          aria-hidden="true"
          className={`
            icon-[mdi--chevron-right] size-4 transition-transform duration-300
            group-hover:translate-x-0.5
          `}
        >
        </i>
      </Link>
    </div>
  )
}
