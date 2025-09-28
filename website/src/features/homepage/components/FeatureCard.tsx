import type { FC, PropsWithChildren } from 'react'
import {
  featureCard,
  featureCardEyebrow,
  featureCardHeader,
  featureCardSubtitle,
  featureCardTitle,
} from '../variants'

export type FeatureCardVariant = 'tools' | 'versions' | 'frameworks'

export interface FeatureCardProps extends PropsWithChildren {
  variant: FeatureCardVariant
  eyebrow: string
  title: string
  subtitle: string
  className?: string
}

export const FeatureCard: FC<FeatureCardProps> = ({ variant, eyebrow, title, subtitle, className, children }) => {
  const headerClass = featureCardHeader({
    ...(variant === 'tools' ? { variant: 'centered' } : {}),
    className: 'relative z-10',
  })

  return (
    <div className={featureCard({ variant, className })}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-40%] -z-10 rotate-6 bg-[radial-gradient(circle,rgba(14,165,233,0.5),transparent_70%)] opacity-45 transition-opacity duration-500 group-hover:opacity-70"
      >
      </div>
      <header className={headerClass}>
        <span className={featureCardEyebrow()}>{eyebrow}</span>
        <h3 className={featureCardTitle()}>{title}</h3>
        <p className={featureCardSubtitle()}>{subtitle}</p>
      </header>
      <div
        className={
          variant === 'tools'
            ? 'relative z-10 flex w-full flex-1 items-center justify-center py-5 pb-8 sm:py-6'
            : 'relative z-10 flex w-full'
        }
      >
        {children}
      </div>
    </div>
  )
}
