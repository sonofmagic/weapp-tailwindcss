import React from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomeLogo from '@site/src/components/HomeLogo'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header>
      <div className="container py-12">
        <div className="mb-4">
          <HomeLogo></HomeLogo>
        </div>
        <div className="flex flex-col items-center">
          <h1>{siteConfig.projectName}</h1>
          <h3 className="text-sky-500">小程序 + tailwindcss 全方面解决方案</h3>
          <p>{siteConfig.title}</p>

          <p>包含 webpack vite gulp 插件</p>
          <p>兼容 uni-app uni-app-vite taro mpx rax 等市面上所有主流框架与 原生开发</p>
          {/* <p>{siteConfig.tagline}</p> */}
          <div>
            <Link className="button button--secondary button--lg " to="/docs/intro">
              立刻开始使用!
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={`${siteConfig.title} ${siteConfig.tagline}`} description={siteConfig.tagline}>
      <HomepageHeader />
      {/* <main>
        <HomepageFeatures />
      </main> */}
    </Layout>
  )
}
