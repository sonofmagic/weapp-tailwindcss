import type { FC } from 'react'
import {
  frameworkCard,
  frameworkDescription,
  frameworkGrid,
  frameworkIcon,
  frameworkIconImage,
  frameworkLabel,
} from '../variants'

export interface FrameworkSupportItem {
  id: string
  label: string
  description: string
  iconSrc: string
  iconAlt: string
}

export interface FrameworkSupportProps {
  items: FrameworkSupportItem[]
}

export const FrameworkSupport: FC<FrameworkSupportProps> = ({ items }) => {
  return (
    <div className={frameworkGrid({ className: 'mx-auto w-full max-w-[420px] sm:max-w-none' })}>
      {items.map(item => (
        <div className={frameworkCard()} key={item.id}>
          <span className={frameworkIcon()}>
            <img alt={item.iconAlt} className={frameworkIconImage()} src={item.iconSrc} />
          </span>
          <span className={frameworkLabel()}>{item.label}</span>
          <span className={frameworkDescription()}>{item.description}</span>
        </div>
      ))}
    </div>
  )
}
