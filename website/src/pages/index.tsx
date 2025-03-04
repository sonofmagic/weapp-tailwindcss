import type { JSX } from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import FrameworksImg from '@site/../assets/weapp-tw-frameworks.png'
import HomeLogo from '@site/src/components/HomeLogo'
import Layout from '@theme/Layout'
import React from 'react'
import GitHubButton from 'react-github-btn'
import GulpLogo from '../assets/gulp.svg'
import NodejsLogo from '../assets/nodejs.svg'
import TailwindcssLogo from '../assets/tw-logo.svg'
import ViteLogo from '../assets/vite.svg'
import WebpackLogo from '../assets/webpack.svg'
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
            {/* <iframe
              src="https://ghbtns.com/github-btn.html?user=sonofmagic&repo=weapp-tailwindcss&type=star&count=true"
              frameborder="0"
              scrolling="0"
              width="110"
              height="20"
              title="GitHub"
            >
            </iframe> */}
            <GitHubButton href="https://github.com/sonofmagic/weapp-tailwindcss" data-color-scheme="light" data-show-count="true" aria-label="Star sonofmagic/weapp-tailwindcss on GitHub">Star</GitHubButton>
            {/* <a href="https://github.com/sonofmagic/weapp-tailwindcss/issues/270" target="_blank" rel="nofollow">
              谁在使用？
            </a> */}
          </div>

          <div>
            {/* <Link to="/docs/tailwindcss-maintenance-book">进阶阅读：如何降低维护成本 ?</Link> */}
            <Link to="/docs/community/group">🚀🚀🚀 加入技术交流群</Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-around space-y-8 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center text-center">
            <h3 className="mb-6">多构建工具适配</h3>
            <div className="relative grid max-w-[500px] grid-cols-2 place-items-center gap-x-10 gap-y-5 p-6">
              {/* eslint-disable-next-line tailwindcss/no-contradicting-classname */}
              <div className="absolute inset-0 rounded-lg border bg-[image:repeating-linear-gradient(315deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-[size:8px_8px] bg-left-top opacity-10"></div>
              <div>
                <WebpackLogo height={64} width={64}></WebpackLogo>
              </div>
              <div>
                <ViteLogo height={64} width={64}></ViteLogo>
              </div>
              <div>
                <GulpLogo height={64} width={64}></GulpLogo>
              </div>
              <div>
                <NodejsLogo height={64} width={64}></NodejsLogo>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <h3>Tailwindcss 多版本支持</h3>
            <div className="flex flex-col">
              <div className="relative">
                <TailwindcssLogo className="w-[250px]"></TailwindcssLogo>
                {/* <div className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 group-hover:bg-sky-400/15 dark:border-sky-300/30"></div> */}
              </div>

              <div className="relative p-1.5 text-xl font-medium tracking-tight text-gray-950 dark:text-white">
                <div className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 group-hover:bg-sky-400/15 dark:border-sky-300/30"></div>
                支持版本列表
              </div>
              <div className="text-sm">
                <div className="relative p-1.5 font-mono font-medium uppercase tracking-widest text-sky-800 dark:text-sky-300">
                  <div className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 group-hover:bg-sky-400/15 dark:border-sky-300/30"></div>
                  <div className="relative flex justify-center">
                    <svg className="w-5.5 absolute left-0 h-[1lh] shrink-0" viewBox="0 0 22 22" fill="none" stroke-linecap="square">
                      <circle cx="11" cy="11" r="11" className="fill-sky-400/25" />
                      <circle cx="11" cy="11" r="10.5" className="stroke-sky-400/25" />
                      <path d="M8 11.5L10.5 14L14 8" className="stroke-sky-800 dark:stroke-sky-300" />
                    </svg>
                    v4.x
                  </div>

                </div>
                <div className="relative p-1.5 font-mono font-medium uppercase tracking-widest text-sky-800 dark:text-sky-300">
                  <div className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 group-hover:bg-sky-400/15 dark:border-sky-300/30"></div>
                  <div className="relative flex justify-center">
                    <svg className="w-5.5 absolute left-0 h-[1lh] shrink-0" viewBox="0 0 22 22" fill="none" stroke-linecap="square">
                      <circle cx="11" cy="11" r="11" className="fill-sky-400/25" />
                      <circle cx="11" cy="11" r="10.5" className="stroke-sky-400/25" />
                      <path d="M8 11.5L10.5 14L14 8" className="stroke-sky-800 dark:stroke-sky-300" />
                    </svg>
                    v3.x
                  </div>
                </div>
                <div className="relative p-1.5 font-mono font-medium uppercase tracking-widest text-sky-800 dark:text-sky-300">
                  <div className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 group-hover:bg-sky-400/15 dark:border-sky-300/30"></div>
                  <div className="relative flex justify-center">
                    <svg className="w-5.5 absolute left-0 h-[1lh] shrink-0" viewBox="0 0 22 22" fill="none" stroke-linecap="square">
                      <circle cx="11" cy="11" r="11" className="fill-sky-400/25" />
                      <circle cx="11" cy="11" r="10.5" className="stroke-sky-400/25" />
                      <path d="M8 11.5L10.5 14L14 8" className="stroke-sky-800 dark:stroke-sky-300" />
                    </svg>
                    v2.x (jit mode)
                  </div>

                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <h3>主流框架与原生开发支持</h3>
            {/* <div>
              <WeappLogo></WeappLogo>
            </div> */}
            <img height={220} src={FrameworksImg}></img>
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
