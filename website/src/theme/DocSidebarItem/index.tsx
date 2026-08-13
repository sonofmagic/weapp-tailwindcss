import type { Props } from '@theme/DocSidebarItem'
import type { ReactNode } from 'react'
import OriginalDocSidebarItem from '@theme-original/DocSidebarItem'

const frameworkLogoPattern = /^[a-z0-9-]+$/

export default function DocSidebarItem({ item, ...props }: Props): ReactNode {
  const frameworkLogo = item.customProps?.frameworkLogo
  const className = typeof frameworkLogo === 'string' && frameworkLogoPattern.test(frameworkLogo)
    ? [item.className, 'framework-sidebar-item', `framework-sidebar-item--${frameworkLogo}`].filter(Boolean).join(' ')
    : item.className

  return <OriginalDocSidebarItem item={{ ...item, className }} {...props} />
}
