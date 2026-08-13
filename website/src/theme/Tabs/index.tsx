import type { Props } from '@theme/Tabs'
import type { ReactElement, ReactNode } from 'react'

import OriginalTabs from '@theme-original/Tabs'
import clsx from 'clsx'
import React, { Children, cloneElement, isValidElement } from 'react'

const packageManagerIcons = {
  npm: 'icon-[logos--npm-icon]',
  yarn: 'icon-[logos--yarn]',
  pnpm: 'icon-[logos--pnpm]',
  bun: 'icon-[logos--bun]',
} as const

interface TabItemProps {
  label?: ReactNode
  value: string
}

function PackageManagerLabel({ label, value }: Required<TabItemProps>) {
  const iconClassName = packageManagerIcons[value as keyof typeof packageManagerIcons]

  if (!iconClassName) {
    return label
  }

  return (
    <span className="package-manager-tab__label">
      <i aria-hidden="true" className={iconClassName}></i>
      <span>{label}</span>
    </span>
  )
}

export default function Tabs(props: Props): ReactNode {
  if (props.groupId !== 'npm2yarn') {
    return <OriginalTabs {...props} />
  }

  const children = Children.map(props.children, (child) => {
    if (!isValidElement<TabItemProps>(child)) {
      return child
    }

    const label = child.props.label ?? child.props.value
    return cloneElement(child as ReactElement<TabItemProps>, {
      label: <PackageManagerLabel label={label} value={child.props.value} />,
    })
  })

  return (
    <OriginalTabs {...props} className={clsx(props.className, 'package-manager-tabs')}>
      {children}
    </OriginalTabs>
  )
}
