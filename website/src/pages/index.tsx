import type { JSX, ReactNode } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import HomeLogo from '@site/src/components/HomeLogo'
import { useUiManagement } from '@site/src/features/ui-management/context'
import Layout from '@theme/Layout'
import HeroGithubBadge from '../components/HeroGithubBadge'
import HeroVersionBadge from '../components/HeroVersionBadge'
import { InteractionPill, PipelinePanel } from '../features/homepage/components'
import { ctaButton } from '../features/homepage/variants'

interface FactItem {
  label: string
  value: string
}

interface CapabilityItem {
  title: string
  description: string
  icon: string
}

interface EntryItem {
  href: string
  label: string
  description: string
  icon: string
}

const facts: FactItem[] = [
  { label: 'Tailwind', value: 'CSS-first / config' },
  { label: '框架', value: 'Taro / uni-app / 原生' },
  { label: '构建器', value: 'Webpack / Vite / Gulp' },
  { label: '运行时', value: 'merge / variants / cva' },
]

const capabilities: CapabilityItem[] = [
  {
    title: '精确转译',
    description: 'JS 与模板只转换 Tailwind 命中类名，避免业务字符串被误伤。',
    icon: 'icon-[mdi--target]',
  },
  {
    title: 'Tailwind 多模式并行',
    description: '新项目使用 CSS-first，存量项目继续保留稳定接入路径。',
    icon: 'icon-[mdi--source-branch]',
  },
  {
    title: '跨生态落地',
    description: '覆盖 Taro、uni-app、原生小程序以及 Webpack、Vite、Gulp 链路。',
    icon: 'icon-[mdi--transit-connection-variant]',
  },
  {
    title: '运行时工具族',
    description: 'merge、variants、cva 在小程序端保持转义前后一致。',
    icon: 'icon-[mdi--package-variant-closed]',
  },
]

const entries: Array<EntryItem & { control?: 'communityEntry' }> = [
  {
    href: '/docs/quick-start/install',
    label: '快速开始',
    description: '按 Tailwind 版本与构建器选择接入路线。',
    icon: 'icon-[mdi--rocket-launch-outline]',
  },
  {
    href: '/docs/quick-start/v4',
    label: 'CSS-first 接入',
    description: '查看 CSS-first 入口、source 与生成模式。',
    icon: 'icon-[mdi--numeric-4-box-outline]',
  },
  {
    href: '/docs/api-v2',
    label: 'API v2',
    description: '类型、插件与配置项的完整参考。',
    icon: 'icon-[mdi--api]',
  },
  {
    href: '/llms',
    label: 'AI / llms',
    description: '让模型读取精简索引，减少过期配置。',
    icon: 'icon-[logos--openai-icon]',
  },
  {
    href: '/docs/community/group',
    label: '社区',
    description: '加入交流群，反馈真实框架问题。',
    icon: 'icon-[mdi--account-group-outline]',
    control: 'communityEntry',
  },
]

const platformIcons: Array<{ id: string, label: string, content: ReactNode }> = [
  {
    id: 'web',
    label: 'Web',
    content: <i aria-hidden="true" className="icon-[logos--chrome] text-[28px]"></i>,
  },
  {
    id: 'miniapp',
    label: '小程序',
    content: <i aria-hidden="true" className="icon-[mdi--wechat] text-[30px] text-[#07c160]"></i>,
  },
  {
    id: 'android',
    label: 'Android',
    content: <i aria-hidden="true" className="icon-[bxl--android] text-[32px] text-[#3DDC84]"></i>,
  },
  {
    id: 'ios',
    label: 'iOS',
    content: <i aria-hidden="true" className="icon-[mdi--apple] text-[30px]"></i>,
  },
  {
    id: 'harmony',
    label: 'HarmonyOS',
    content: <i aria-hidden="true" className="icon-[mdi--cellphone-link] text-[29px] text-[#E5484D]"></i>,
  },
]

function HomepageHeader() {
  const { homepage } = useUiManagement()

  return (
    <main className="home-v5">
      <section className="home-hero">
        <div className="home-hero__content">
          {homepage.heroContent && (
            <div className="ui-homepage-hero-content home-hero__copy">
              <div className="home-hero__brand-row">
                <HomeLogo />
                {homepage.heroBadge && (
                  <span className="ui-homepage-hero-badge home-hero__badge">
                    Tailwind CSS website mode
                  </span>
                )}
              </div>
              <div className="home-hero__title-wrap">
                {homepage.heroTitle && (
                  <h1 className="ui-homepage-hero-title home-hero__title">
                    <span className="home-hero__title-prefix">
                      <span>weapp</span>
                      <span className="from-weapp-to-tailwindcss">-</span>
                    </span>
                    <span className="home-hero__title-tail">tailwindcss</span>
                  </h1>
                )}
                {homepage.gstarBadge && (
                  <a
                    aria-label="查看版权与证书页面"
                    className="home-hero__gstar-corner ui-homepage-gstar-badge"
                    href="/copyright"
                    title="G-Star 毕业项目认证"
                  >
                    <img
                      alt="AtomGit G-Star 毕业项目认证徽章"
                      className="home-hero__gstar-corner-image"
                      loading="lazy"
                      src="/img/gstar-tag-twinkle.gif"
                    />
                  </a>
                )}
              </div>
              {homepage.heroSubtitlePrimary && (
                <p className="ui-homepage-hero-subtitle-primary home-hero__lead">
                  让 Tailwind CSS 稳定跑在小程序里。
                </p>
              )}
              {homepage.heroSubtitleSecondary && (
                <p className="ui-homepage-hero-subtitle-secondary home-hero__sublead">
                  对齐 Tailwind CSS 的主流写法，同时接管 Web 与小程序目标的生成、转义与运行时边界。
                </p>
              )}
              {homepage.platformTags && (
                <div className="home-hero__platform-strip" aria-label="支持平台">
                  {platformIcons.map(({ id, label, content }) => (
                    <span aria-label={label} className="home-hero__platform-icon" key={id} role="img" title={label}>
                      <span className="sr-only">{label}</span>
                      {content}
                    </span>
                  ))}
                </div>
              )}
              <div className="home-hero__actions">
                {homepage.primaryCta && (
                  <a className={`${ctaButton()} home-cta ui-homepage-primary-cta`} href="/docs/intro">
                    <span>立即开始体验</span>
                    <i aria-hidden="true" className="icon-[mdi--arrow-right] text-[1.1rem]"></i>
                  </a>
                )}
                {homepage.aiEntry && (
                  <InteractionPill
                    className="ui-homepage-ai-entry"
                    href="/llms"
                    icon={<i aria-hidden="true" className="icon-[logos--openai-icon] text-[18px]"></i>}
                    label="AI 学习入口"
                  />
                )}
                {homepage.communityEntry && (
                  <InteractionPill
                    className="ui-homepage-community-entry"
                    href="/docs/community/group"
                    icon={<i aria-hidden="true" className="icon-[mdi--account-group-outline] text-[18px]"></i>}
                    label="加入技术交流群"
                  />
                )}
              </div>
            </div>
          )}
          <PipelinePanel />
        </div>
      </section>

      {homepage.platformTags && (
        <section className="ui-homepage-platform-tags home-facts" aria-label="支持矩阵">
          {facts.map(fact => (
            <div className="home-facts__item" key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
          <div className="home-facts__platforms">
            {platformIcons.map(({ id, label, content }) => (
              <span aria-label={label} className="home-facts__icon" key={id} role="img" title={label}>
                <span className="sr-only">{label}</span>
                {content}
              </span>
            ))}
          </div>
          {(homepage.githubBadge || homepage.npmVersionBadge) && (
            <div className="home-facts__signals">
              {homepage.githubBadge && (
                <HeroGithubBadge className="ui-homepage-github-badge" />
              )}
              {homepage.npmVersionBadge && (
                <HeroVersionBadge className="ui-homepage-npm-version-badge" />
              )}
            </div>
          )}
        </section>
      )}

      {homepage.heroFeatureGrid && (
        <section className="ui-homepage-hero-feature-grid home-capabilities" aria-labelledby="home-capabilities-title">
          <div className="home-section-heading">
            <h2 id="home-capabilities-title">守住工程边界，接管生成与转译</h2>
            <p>复用 Tailwind 输入，把源码扫描、样式生成、类名转义和运行时工具放在一条工程链路里。</p>
          </div>
          <div className="home-capabilities__layout">
            {homepage.buildToolsCard && (
              <article className="ui-homepage-build-tools-card home-capability home-capability--large">
                <i aria-hidden="true" className="icon-[mdi--webpack]"></i>
                <h3>构建器接管 Tailwind 生成</h3>
                <p>Webpack、Vite、Gulp 与自定义 Node 流程都由 weapp-tailwindcss 接管输出，不在小程序构建里叠加官方 Tailwind 生成插件。</p>
              </article>
            )}
            <div className="home-capabilities__grid">
              {capabilities.map((item, index) => {
                const visible = index === 1
                  ? homepage.versionsCard
                  : index === 2
                    ? homepage.frameworksCard
                    : true
                if (!visible) {
                  return null
                }

                return (
                  <article className="home-capability" key={item.title}>
                    <i aria-hidden="true" className={item.icon}></i>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="home-v5-story" aria-labelledby="home-v5-title">
        <div>
          <h2 id="home-v5-title">同一套 Tailwind 输入，按目标端交付产物</h2>
        </div>
        <div className="home-v5-story__body">
          <p>
            Web 保持 Tailwind 原生语义；小程序补齐选择器、单位、转义与运行时边界。团队统一入口，再按框架接入。
          </p>
          <a href="/docs/api-v2">查看 API v2</a>
        </div>
      </section>

      <section className="home-entrypoints" aria-label="文档入口">
        {entries.map((entry) => {
          if (entry.control && !homepage[entry.control]) {
            return null
          }

          return (
            <a
              className={['home-entrypoint', entry.control === 'communityEntry' ? 'ui-homepage-community-entry' : ''].filter(Boolean).join(' ')}
              href={entry.href}
              key={entry.href}
            >
              <i aria-hidden="true" className={entry.icon}></i>
              <span>
                <strong>{entry.label}</strong>
                <small>{entry.description}</small>
              </span>
            </a>
          )
        })}
      </section>
    </main>
  )
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout wrapperClassName="homepage" title={`${siteConfig.title} ${siteConfig.tagline}`} description={siteConfig.tagline}>
      <HomepageHeader />
    </Layout>
  )
}
