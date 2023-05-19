import React from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomeLogo from '@site/src/components/HomeLogo'
import FrameworksImg from '@site/../assets/weapp-tw-frameworks.png'
import PluginsImg from '@site/../assets/weapp-tw-plugins.png'
// import Plugins from '@site/src/components/Plugins'
// import Frameworks from '@site/src/components/Frameworks'
function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header>
      <div className="container py-12">
        <div className="mb-4">
          <HomeLogo></HomeLogo>
        </div>
        <div className="flex flex-col items-center">
          <h1>weapp-tailwindcss</h1>
          <h3 className="text-sky-500">小程序 + tailwindcss 全方面解决方案</h3>
          <p>{siteConfig.title}</p>
          <div>
            <Link className="button button--secondary button--lg " to="/docs/intro">
              立刻开始使用!
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 justify-around mt-8">
          <div className="text-center">
            <h3>不仅仅是 webpack</h3>
            <img src={PluginsImg}></img>
            {/* <Plugins></Plugins> */}
          </div>
          <div className="text-center">
            <h3>主流框架与原生开发支持</h3>
            <img src={FrameworksImg}></img>
            {/* <Frameworks></Frameworks> */}
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
