import { useLocation } from '@docusaurus/router'
import Layout from '@theme-original/Layout'
import React from 'react'

export default function LayoutWrapper(props) {
  const location = useLocation()

  return (
    <div className="relative">
      {location.pathname !== '/' && <div className="light-effect pointer-events-none absolute right-[13.14%] z-[201]"></div> }
      <Layout {...props} />
    </div>
  )
}
