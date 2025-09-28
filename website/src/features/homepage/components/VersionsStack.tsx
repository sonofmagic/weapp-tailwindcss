import type { ComponentType, FC, SVGProps } from 'react'
import Link from '@docusaurus/Link'
import {
  versionsPill,
  versionsPillCta,
  versionsPillLabel,
  versionsStack,
  versionsStackHalo,
  versionsStackLogo,
  versionsStackTimeline,
} from '../variants'

export interface VersionLink {
  href: string
  label: string
  cta: string
}

export interface VersionsStackProps {
  Logo: ComponentType<SVGProps<SVGSVGElement>>
  links: VersionLink[]
}

export const VersionsStack: FC<VersionsStackProps> = ({ Logo, links }) => {
  return (
    <div className={versionsStack()}>
      <div aria-hidden="true" className={versionsStackHalo()}></div>
      <Logo className={versionsStackLogo()} />
      <div className={versionsStackTimeline({ className: 'relative z-10' })}>
        {links.map(({ href, label, cta }) => (
          <Link className={versionsPill()} href={href} key={href}>
            <span className={versionsPillLabel()}>{label}</span>
            <span className={versionsPillCta()}>{cta}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
