import AdsContainerElement from '@site/src/components/AdsContainerElement'
import React from 'react'

function AdsContainer() {
  return (
    <div className={`
      border-t
      border-[color:var(--ifm-toc-border-color)]
      pt-4
    `}
    >
      <AdsContainerElement />
    </div>

  )
}

export default AdsContainer
