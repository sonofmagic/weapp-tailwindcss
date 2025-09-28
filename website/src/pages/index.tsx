import type { FC, JSX, PropsWithChildren } from 'react'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import FrameworksImg from '@site/../assets/weapp-tw-frameworks.png'
import HomeLogo from '@site/src/components/HomeLogo'
import Layout from '@theme/Layout'
// import { create } from '@weapp-tailwindcss/merge'
import React from 'react'
import GulpLogo from '../assets/gulp.svg'
import NodejsLogo from '../assets/nodejs.svg'
import TailwindcssLogo from '../assets/tw-logo.svg'
import ViteLogo from '../assets/vite.svg'
import WebpackLogo from '../assets/webpack.svg'
import HeroGithubBadge from '../components/HeroGithubBadge'

// const { twMerge } = create(
//   {
//     disableEscape: false,
//   },
// )

// console.log(twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]'))

const CoolTag: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="group relative px-1.5 text-sm/6 text-sky-800 dark:text-sky-300">
      <span className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 group-hover:bg-sky-400/15 dark:border-sky-300/30"></span>
      {children}
      <svg width="5" height="5" viewBox="0 0 5 5" className="absolute left-[-2px] top-[-2px] fill-sky-300 dark:fill-sky-300/50"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg>
      <svg width="5" height="5" viewBox="0 0 5 5" className="absolute right-[-2px] top-[-2px] fill-sky-300 dark:fill-sky-300/50"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg>
      <svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] left-[-2px] fill-sky-300 dark:fill-sky-300/50"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg>
      <svg width="5" height="5" viewBox="0 0 5 5" className="absolute bottom-[-2px] right-[-2px] fill-sky-300 dark:fill-sky-300/50"><path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path></svg>
    </div>
  )
}

// mask-image: linear-gradient(rgba(0, 0, 0, 1), transparent);
function HomepageHeader() {
  // const { siteConfig } = useDocusaurusContext()
  return (
    <header className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 size-[420px] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl"></div>
        <div className="absolute right-[-20%] top-[20%] size-[520px] rounded-full bg-emerald-400/10 blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-15%] size-[540px] rounded-full bg-sky-500/10 blur-3xl"></div>
      </div>
      <div className="container relative z-[1] flex min-h-svh flex-col justify-center gap-12 py-12">
        <div className="home-hero mx-auto w-full max-w-[min(1200px,94vw)]">
          <div className="home-hero__mesh"></div>
          <div className="home-hero__aurora"></div>
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-4">
              <div className="hero-logo-wrapper">
                <HomeLogo></HomeLogo>
              </div>
              <span className="floating-icon">
                <i className="iconify mdi--sparkles"></i>
                小程序 · Tailwind 精准适配
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-50">
              <span className="text-[#07c160]">weapp</span>
              <span className="from-weapp-to-tailwindcss">-</span>
              <span className="text-sky-500">tailwindcss</span>
            </h1>
            <h3 className="mt-5 text-xl font-medium text-slate-700 sm:text-2xl dark:text-slate-200">
              <b className="text-[#07c160]">降低</b>
              团队维护成本，
              <b className="text-sky-500">加速</b>
              交付节奏的
            </h3>
            <h3 className="text-lg text-slate-600 sm:text-xl dark:text-slate-200">
              <span className="text-[#07c160]">小程序</span>
              {' '}
              使用
              {' '}
              <span className="text-sky-500">tailwindcss</span>
              {' '}
              一站式解决方案
            </h3>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Link className="cta-button" to="/docs/intro">
                <span>
                  立即开始体验
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
              <div className="interaction-pill">
                <Link className="interaction-pill__link group" to="/docs/community/group">
                  <span className="interaction-pill__icon">
                    🚀
                  </span>
                  <span className="interaction-pill__label">加入技术交流群</span>
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <HeroGithubBadge />
              <span className="hero-metric-chip">
                <span className="hero-metric-chip__dot"></span>
                开源社区持续更新
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center rounded-2xl border border-slate-200/50 bg-white/40 p-3 text-sm text-slate-600 shadow-inner dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <div className="mb-2 flex items-center text-base font-medium text-slate-700 dark:text-slate-100">
                🔥 最新版本现已支持 uni-app x 同构构建
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <CoolTag>
                  <div className="flex items-center space-x-1">
                    <span>Web</span>
                    <i className="iconify-color logos--chrome"></i>
                  </div>
                </CoolTag>

                <CoolTag>
                  <div className="flex items-center space-x-1">
                    <span>小程序</span>
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path d="M512 0a512 512 0 1 0 512 512A512 512 0 0 0 512 0z m256.717 460.186a151.962 151.962 0 0 1-87.347 65.74 83.251 83.251 0 0 1-24.474 4.096 29.082 29.082 0 0 1 0-58.163 15.667 15.667 0 0 0 6.451-1.229 91.443 91.443 0 0 0 55.91-40.96 75.264 75.264 0 0 0 11.06-39.628c0-45.978-42.496-83.866-94.31-83.866a105.267 105.267 0 0 0-51.2 13.414 81.92 81.92 0 0 0-43.725 70.452v244.224a138.445 138.445 0 0 1-72.704 120.422 159.642 159.642 0 0 1-79.77 20.48c-84.378 0-153.6-63.488-153.6-142.029a136.192 136.192 0 0 1 19.763-69.837 151.962 151.962 0 0 1 87.347-65.74 85.914 85.914 0 0 1 24.474-4.096 29.082 29.082 0 1 1 0 58.163 15.667 15.667 0 0 0-6.451 1.229 95.949 95.949 0 0 0-55.91 40.96 75.264 75.264 0 0 0-11.06 39.628c0 45.978 42.496 83.866 94.925 83.866a105.267 105.267 0 0 0 51.2-13.414 81.92 81.92 0 0 0 43.622-70.452V390.35a138.752 138.752 0 0 1 72.807-120.525 151.245 151.245 0 0 1 79.155-21.504c84.378 0 153.6 63.488 153.6 142.029a136.192 136.192 0 0 1-19.763 69.837z" fill="#00B240" p-id="4692"></path></svg>
                  </div>
                </CoolTag>

                <CoolTag>
                  <div className="flex items-center space-x-1">
                    <span>安卓</span>
                    <i className="iconify-color logos--android-icon"></i>
                  </div>

                </CoolTag>

                <CoolTag>
                  <div className="flex items-center space-x-1">
                    <span>IOS</span>
                    <i className="iconify logos--apple text-black/80 dark:text-white"></i>
                  </div>

                </CoolTag>

                <CoolTag>
                  <div className="flex items-center space-x-1">
                    <span>鸿蒙</span>
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em">
                      <path d="M227.556 0h568.888Q1024 0 1024 227.556v568.888Q1024 1024 796.444 1024H227.556Q0 1024 0 796.444V227.556Q0 0 227.556 0z" fill="#FFEEF1" p-id="6225"></path>
                      <path d="M579.698 709.404l232.675 6.998c-13.653 27.875-33.905 52.11-61.44 66.048-22.869 9.842-53.475 1.138-78.848-10.24l-10.524-5.006-9.728-5.064-8.647-4.835-10.41-6.258-4.95-3.072-48.128-38.514z m-136.704 3.698l-47.787 34.873-16.327 9.557-9.102 5.007-10.24 5.233c-26.852 13.199-61.725 25.487-87.495 14.678-24.463-15.36-43.179-33.28-56.832-54.33l-4.836-8.02 232.619-6.998zM148.935 522.297l0.683 0.17 5.461 2.56 9.785 5.12 88.633 48.072 20.935 11.093 8.647 4.437 9.444 5.063 16.839 9.444 25.941 15.19 48.356 29.126 40.96 25.6 17.806 11.492 3.243 2.332a4.665 4.665 0 0 1 0.625 0.57c0 0.227-0.91 0.454-2.617 0.682l-4.38 0.398-9.956 0.455-23.78 0.57-49.208 0.34-37.945-0.34-31.971-0.74-18.603-0.854-6.03-0.569c-23.894-3.3-75.037-17.237-102.571-62.35-14.108-23.438-17.237-51.541-16.498-73.216l0.512-8.874c0.228-2.788 0.57-5.405 0.854-7.851l1.137-6.656 1.138-5.348c0.967-3.754 1.991-5.916 2.56-5.916z m728.747-0.341l1.536 9.045 0.853 6.428 0.74 7.737 0.569 8.932c0.853 21.902-1.252 51.086-14.28 75.093-27.25 45.397-78.677 59.335-102.57 62.692l-5.974 0.569-8.362 0.455-28.9 0.853-35.954 0.569h-37.66l-35.612-0.455-18.091-0.57-9.102-0.511c-3.13-0.285-4.836-0.569-4.836-0.91l3.925-2.788 22.813-14.563 42.894-26.454 27.705-16.782 27.136-16.043 18.603-10.695 10.922-6.087 9.5-5.12 24.065-12.345 35.328-19.058 66.617-36.18 6.371-3.187a6.997 6.997 0 0 1 1.764-0.625zM768.569 337.749c6.656 0 58.083 52.11 61.44 97.28 3.129 46.535-15.474 77.085-64.512 112.925l-12.06 8.647-16.328 11.15-12.117 7.965-12.857 8.192-20.252 12.515-27.648 16.669-27.193 15.7-19.058 10.64-17.237 9.272-10.127 5.177-8.817 4.323-7.282 3.357c-6.542 2.73-10.525 3.811-11.037 2.787-0.512-1.024 0.171-3.754 1.707-7.964l2.39-5.689 5.12-11.036 6.826-13.426 8.135-15.53 12.743-23.155 14.223-25.144 19.57-33.736 16.668-28.046 8.192-13.54 13.255-21.105 9.102-13.995 18.318-27.25 8.989-12.913 17.237-23.894 7.965-10.638 10.98-14.165 6.428-7.965 5.575-6.599 2.503-2.73 4.153-4.38c2.446-2.39 4.153-3.699 5.006-3.699z m-513.365 0c0.853 0 2.275 1.195 4.494 3.414l3.584 4.096 4.494 5.518 8.021 10.695 6.258 8.59 10.41 14.791 28.16 41.074 45.17 67.869 13.256 20.65 17.578 28.274 16.669 27.99 15.246 26.51 10.012 18.09 8.534 16.1 6.656 13.54 3.3 7.281c2.844 6.542 4.152 10.809 3.583 12.06-0.284 0.285-1.479 0-3.413-0.625l-8.135-3.527-16.953-8.363-22.3-11.776-26.056-14.336-28.103-15.986-21.39-12.63-13.995-8.419-20.081-12.515-12.516-8.022-11.491-7.736-10.354-7.225c-55.126-38.116-78.678-72.989-72.022-118.102 3.869-26.34 21.846-55.068 37.49-74.41l6.486-7.68 5.973-6.258c5.518-5.689 9.785-8.932 11.435-8.932z m201.728-100.522c17.92 42.496 31.516 86.585 40.789 131.754 0.341 2.674 0.683 5.803 0.967 9.33l0.683 11.72 0.455 13.766 0.341 23.78-0.17 31.175-0.513 32.2-1.479 56.49-3.584 95.971c0 3.3-3.3 3.3-6.656 0l-3.185-4.665-30.038-48.014-25.315-41.415-13.483-22.414-20.992-35.556-10.695-18.773-8.533-15.474-4.21-8.135-4.665-9.728a361.13 361.13 0 0 1-2.333-5.234l-4.664-10.98c-16.783-41.87-29.128-98.246 1.706-140.685a124.814 124.814 0 0 1 95.574-45.113z m109.51 0c37.49 0 71.34 17.237 95.574 45.113 29.412 40.561 19.342 93.696 5.234 133.29l-4.096 10.923-4.153 10.07-3.982 8.988-3.698 7.623-7.965 15.018-10.41 18.376-20.935 35.498-22.756 37.547-35.954 57.856-13.312 20.594a21.618 21.618 0 0 1-1.422 1.99c-2.844 2.845-5.689 3.243-6.485 1.195l-0.285-3.584-2.332-59.904-1.934-63.886-0.91-46.99-0.285-28.672v-23.438l0.284-15.133 0.456-13.425 0.284-6.03 0.796-10.298 0.456-4.266c6.94-45.17 20.878-86.642 37.83-128.455z" fill="#E5484D" p-id="6226"></path>
                    </svg>
                  </div>

                </CoolTag>

              </div>
              <div className="mt-2">
                <Link className="flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white" to="/docs/uni-app-x">
                  详见
                  {' '}
                  <img className="mx-1 h-6" src="/img/uni-app-x-logo.ico" />
                  {' '}
                  uni-app x 专题
                </Link>

              </div>
            </div>
          </div>

          <div className="grid w-full gap-7 md:grid-cols-3 md:items-stretch">
            <div className="feature-card feature-card--tools">
              <header className="feature-card__header">
                <span className="feature-card__eyebrow">Build Flow</span>
                <h3 className="feature-card__title">多构建工具适配</h3>
                <p className="feature-card__subtitle">Webpack、Vite、Gulp、Node CLI 多场景集成</p>
              </header>
              <div className="tool-orbit">
                <div className="tool-orbit__ring"></div>
                <div className="tool-orbit__ring tool-orbit__ring--inner"></div>
                <div className="tool-orbit__item tool-orbit__item--webpack">
                  <WebpackLogo height={48} width={48}></WebpackLogo>
                  <span className="tool-orbit__label">Webpack</span>
                </div>
                <div className="tool-orbit__item tool-orbit__item--vite">
                  <ViteLogo height={48} width={48}></ViteLogo>
                  <span className="tool-orbit__label">Vite</span>
                </div>
                <div className="tool-orbit__item tool-orbit__item--gulp">
                  <GulpLogo height={48} width={48}></GulpLogo>
                  <span className="tool-orbit__label">Gulp</span>
                </div>
                <div className="tool-orbit__item tool-orbit__item--node">
                  <NodejsLogo height={48} width={48}></NodejsLogo>
                  <span className="tool-orbit__label">Node</span>
                </div>
                <div className="tool-orbit__core">
                  <span>Unified</span>
                  <span>Pipeline</span>
                </div>
              </div>
            </div>
            <div className="feature-card feature-card--versions">
              <header className="feature-card__header">
                <span className="feature-card__eyebrow">Version Matrix</span>
                <h3 className="feature-card__title">Tailwind 多版本无缝支持</h3>
                <p className="feature-card__subtitle">3.x 正式版、4.x 预览版及 2.x JIT 模式</p>
              </header>
              <div className="versions-stack">
                <div className="versions-stack__halo"></div>
                <TailwindcssLogo className="versions-stack__logo"></TailwindcssLogo>
                <div className="versions-stack__timeline">
                  <div className="versions-stack__timeline-line"></div>
                  <Link className="versions-pill" href="/docs/quick-start/v4">
                    <span className="versions-pill__label">Tailwind CSS 4.x</span>
                    <span className="versions-pill__cta">新特性预览</span>
                  </Link>
                  <Link className="versions-pill" href="/docs/quick-start/install">
                    <span className="versions-pill__label">Tailwind CSS 3.x</span>
                    <span className="versions-pill__cta">生产首选</span>
                  </Link>
                  <Link className="versions-pill" href="/docs/quick-start/v2">
                    <span className="versions-pill__label">Tailwind CSS 2.x (JIT)</span>
                    <span className="versions-pill__cta">兼容保留</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="feature-card feature-card--frameworks">
              <header className="feature-card__header">
                <span className="feature-card__eyebrow">Ecosystem</span>
                <h3 className="feature-card__title">主流框架与原生开发支持</h3>
                <p className="feature-card__subtitle">taro、uni-app、mpx、rax、自定义原生工程均可平滑接入</p>
              </header>
              <div className="frameworks-cloud">
                <img alt="Frameworks" className="frameworks-cloud__image" height={220} src={FrameworksImg}></img>
                <div className="frameworks-cloud__badge frameworks-cloud__badge--taro">Taro</div>
                <div className="frameworks-cloud__badge frameworks-cloud__badge--uni">uni-app</div>
                <div className="frameworks-cloud__badge frameworks-cloud__badge--mpx">MPX</div>
                <div className="frameworks-cloud__badge frameworks-cloud__badge--rax">Rax</div>
              </div>
            </div>
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
