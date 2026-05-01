import type { ComponentProps } from 'react'
import { useLocation } from '@docusaurus/router'
import { UiManagementProvider } from '@site/src/features/ui-management/context'
import Layout from '@theme-original/Layout'
import React from 'react'

type LayoutWrapperProps = ComponentProps<typeof Layout>

export default function LayoutWrapper(props: LayoutWrapperProps) {
  const location = useLocation()
  const isHomepage = location.pathname === '/'

  return (
    <UiManagementProvider>
      <div className="relative">
        {/* {location.pathname !== '/' && (
          <div className="pointer-events-none absolute inset-0 z-[201]">
            <div className="light-effect pointer-events-none absolute right-[13.14%]"></div>
          </div>
        )} */}
        <Layout {...props} />
        {isHomepage && (
          <div className="
            pointer-events-none absolute inset-0 z-[202] flex-none
          "
          >
            <div className={`
              size-full rounded-none bg-[url(/img/framer.png)] bg-[length:128px]
              bg-repeat opacity-5
            `}
            >
            </div>
          </div>
        )}
      </div>
    </UiManagementProvider>
  )
}
