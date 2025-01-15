import type { JSX } from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import FrameworksImg from '@site/../assets/weapp-tw-frameworks.png'
import PluginsImg from '@site/../assets/weapp-tw-plugins.png'
import HomeLogo from '@site/src/components/HomeLogo'
import Layout from '@theme/Layout'
import React from 'react'
// import Plugins from '@site/src/components/Plugins'
// import Frameworks from '@site/src/components/Frameworks'
// mask-image: linear-gradient(rgba(0, 0, 0, 1), transparent);
function HomepageHeader() {
  // const { siteConfig } = useDocusaurusContext()
  return (
    <header>
      <div className="container py-12">
        <div className="mb-4">
          <HomeLogo></HomeLogo>
        </div>
        <div className="flex flex-col items-center">
          <h1>
            <span className="text-[#07c160]">weapp</span>
            <span className="from-weapp-to-tailwindcss">-</span>
            <span className="text-sky-500">tailwindcss</span>
          </h1>
          <h3>
            <b className="text-[#07c160]">降低</b>
            开发维护成本，
            <b className="text-sky-500">提升</b>
            开发效率的
          </h3>
          <h3 className="text-lg sm:text-xl">
            <span className="text-[#07c160]">小程序</span>
            {' '}
            使用
            {' '}
            <span className="text-sky-500">tailwindcss</span>
            {' '}
            全方面解决方案
          </h3>
          {/* <p>{siteConfig.title}</p> */}
          <div className="mb-4">
            <Link className="button button--secondary button--lg " to="/docs/intro">
              立刻开始使用!
            </Link>
          </div>

          <div className="mb-2 flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=sonofmagic&repo=weapp-tailwindcss&type=star&count=true"
              frameborder="0"
              scrolling="0"
              width="110"
              height="20"
              title="GitHub"
            >
            </iframe>
            <a href="https://github.com/sonofmagic/weapp-tailwindcss/issues/270" target="_blank" rel="nofollow">
              谁在使用？
            </a>
          </div>

          <div>
            {/* <Link to="/docs/tailwindcss-maintenance-book">进阶阅读：如何降低维护成本 ?</Link> */}
            <Link to="/docs/community/group">🚀🚀🚀 加入技术交流群</Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-around space-y-8 md:flex-row md:space-y-0">
          <div className="text-center">
            <h3>不仅仅是 webpack/vite</h3>
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
