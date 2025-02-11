import type { JSX } from 'react'
import AdsContainer from '@site/src/components/AdsContainer'
import TOCItems from '@theme-original/TOCItems'
import clsx from 'clsx'
import React from 'react'

import styles from './styles.module.css'

// Using a custom className
// This prevents TOCInline/TOCCollapsible getting highlighted by mistake
const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight'
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active'

export default function TOC({ className, ...props }): JSX.Element {
  return (
    <div className={clsx(styles.tableOfContents, 'thin-scrollbar', className, '')}>
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
      <AdsContainer></AdsContainer>
    </div>
  )
}
