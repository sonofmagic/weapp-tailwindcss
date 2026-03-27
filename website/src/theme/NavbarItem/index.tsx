import type { ComponentProps } from 'react'
import { useUiManagement } from '@site/src/features/ui-management/context'
import { isNavbarItemVisible } from '@site/src/features/ui-management/navbar'
import OriginalNavbarItem from '@theme-original/NavbarItem'

type NavbarItemProps = ComponentProps<typeof OriginalNavbarItem>

export default function NavbarItemWrapper(props: NavbarItemProps) {
  const { navbar } = useUiManagement()

  if (!isNavbarItemVisible(props, navbar)) {
    return null
  }

  return <OriginalNavbarItem {...props} />
}
