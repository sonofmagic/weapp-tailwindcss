import Link from '@docusaurus/Link'
import Aizex from '@site/static/img/ads/aizex-mini.png'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'

const adItems = [
  {
    badge: 'SPONSORED',
    cardClassName: `
      overflow-hidden border-[#8b7bff]/20
      bg-[radial-gradient(circle_at_12%_18%,rgba(139,123,255,0.20),transparent_32%),radial-gradient(circle_at_88%_14%,rgba(14,165,233,0.16),transparent_24%),linear-gradient(145deg,rgba(255,255,255,0.97),rgba(245,243,255,0.98))]
      text-slate-900 shadow-[0_20px_44px_rgba(99,102,241,0.16)]
      hover:shadow-[0_24px_54px_rgba(99,102,241,0.2)]
      dark:border-[#8b7bff]/35 dark:text-white
      dark:shadow-[0_24px_56px_rgba(14,165,233,0.14),0_10px_30px_rgba(76,29,149,0.24)]
      dark:hover:shadow-[0_30px_70px_rgba(99,102,241,0.32),0_12px_36px_rgba(14,165,233,0.18)]
      dark:bg-[radial-gradient(circle_at_14%_18%,rgba(139,123,255,0.34),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(52,211,153,0.18),transparent_28%),linear-gradient(145deg,rgba(15,23,42,0.98),rgba(30,41,59,0.94))]
    `,
    description: '企业级的分布式搜索型数据库',
    href: 'https://easysearch.cn/',
    imageWrapperClassName: `
      relative z-10 px-1 pt-5 pb-1
    `,
    logoClassName: 'h-10 w-auto',
    metaClassName: 'hidden',
    titleClassName: 'hidden',
    descriptionClassName: 'mx-auto max-w-[15ch] text-center text-[12px] leading-5 text-slate-600 dark:text-[#ddd6fe]',
    footerClassName: 'hidden',
    renderLogo: () => (
      <>
        <img
          className="
            h-10 w-auto
            dark:hidden
          "
          src="/img/ads/easysearch.svg"
          alt="Easysearch"
        >
        </img>
        <img
          className="
            hidden h-10 w-auto
            dark:block
          "
          src="/img/ads/easysearch-dark.svg"
          alt="Easysearch"
        >
        </img>
      </>
    ),
    title: 'Easysearch',
    tone: 'hero',
  },
  {
    badge: '亲测推荐',
    cardClassName: '',
    description: '更好用的「GPT-5 x Claude」使用方式',
    href: 'https://aizex.cn/0LcJ7G',
    imageWrapperClassName: `
      rounded-xl bg-white/70 px-2 py-1
      dark:bg-slate-900/30
    `,
    logoClassName: 'h-14 w-auto',
    metaClassName: 'hidden',
    titleClassName: 'text-base font-semibold tracking-[0.01em]',
    descriptionClassName: 'text-xs text-sky-600 dark:text-sky-300',
    footerClassName: 'hidden',
    renderLogo: () => <img className="h-14 w-auto" src={Aizex} alt="aizex"></img>,
    title: 'Aizex 合租面板',
    tone: 'default',
  },
] as const

function AdsContainerElement() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.ResizeObserver === 'undefined') {
      return
    }

    const element = containerRef.current
    if (!element) {
      return
    }

    const updateCompactState = (width: number) => {
      setIsCompact(width < 300)
    }

    updateCompactState(element.getBoundingClientRect().width)

    const observer = new window.ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        updateCompactState(entry.contentRect.width)
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="space-y-4 px-4">
      {/* 暂时仅展示 Easysearch 赞助位，保留 Aizex 配置以便后续恢复。 */}
      {adItems.filter(item => item.title === 'Easysearch').map(item => (
        <a
          key={item.title}
          className={clsx(
            `
              relative flex rounded-2xl border border-slate-200/70
              bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,245,249,0.9))]
              p-4 text-slate-900 shadow-[0_18px_36px_rgba(15,23,42,0.06)]
              transition-all duration-300
              hover:-translate-y-0.5 hover:no-underline
              hover:shadow-[0_22px_44px_rgba(14,165,233,0.14)]
              dark:border-slate-700/70
              dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.86))]
              dark:text-slate-100 dark:shadow-[0_22px_44px_rgba(2,8,23,0.34)]
              dark:hover:shadow-[0_24px_52px_rgba(56,189,248,0.18)]
            `,
            item.cardClassName,
            item.tone === 'hero'
              ? 'flex-col items-center gap-2 px-3.5 pb-3.5 pt-2'
              : (isCompact
                  ? 'flex-col gap-3'
                  : `items-center justify-between gap-4`),
          )}
          target="_blank"
          href={item.href}
          rel="noopener sponsored nofollow"
        >
          {item.tone === 'hero'
            ? (
                <>
                  <div className="
                    absolute inset-0
                    bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_32%,transparent_66%,rgba(56,189,248,0.14))]
                    opacity-90
                  "
                  >
                  </div>
                  <div className="
                    bg-[#8b7bff]/16
                    dark:bg-[#8b7bff]/18
                    absolute -right-8 bottom-1 h-16 w-16 rounded-full blur-2xl
                  "
                  >
                  </div>
                  <div className="
                    absolute left-3 top-2 text-[10px] font-semibold uppercase
                    tracking-[0.22em] text-slate-500
                    dark:text-white
                    dark:[text-shadow:0_1px_12px_rgba(15,23,42,0.58)]
                  "
                  >
                    {item.badge}
                  </div>
                  <div className="
                    absolute -right-5 top-3 h-7 w-16 rotate-[24deg]
                    bg-[linear-gradient(90deg,rgba(125,211,252,0.10),rgba(139,123,255,0.28),rgba(139,123,255,0))]
                    dark:bg-[linear-gradient(90deg,rgba(125,211,252,0.15),rgba(139,123,255,0.4),rgba(139,123,255,0))]
                  "
                  >
                  </div>
                </>
              )
            : null}
          <div
            className={clsx(
              'flex shrink-0 items-center',
              item.tone === 'hero'
                ? 'w-full justify-center'
                : (isCompact ? 'justify-center' : ''),
            )}
          >
            <div className={clsx('flex items-center justify-center', item.imageWrapperClassName)}>
              {item.renderLogo()}
            </div>
          </div>
          <div
            className={clsx(
              'flex flex-1 flex-col justify-around',
              item.tone === 'hero'
                ? 'relative z-10 w-full items-center text-center'
                : (isCompact ? 'text-center' : 'self-stretch'),
            )}
          >
            <div className={clsx('mb-1', item.metaClassName)}>
              品牌赞助位
            </div>
            <div className={item.titleClassName}>
              {item.title}
            </div>
            <div className={clsx('mt-1', item.descriptionClassName)}>
              {item.description}
            </div>
            <div className={clsx('mt-2', item.footerClassName)}>
              Explore Search Infrastructure
            </div>
          </div>
          {item.badge && item.tone !== 'hero'
            ? (
                <div
                  className={`
                    absolute right-0 top-0 rounded-bl-lg rounded-tr-2xl
                    bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-700
                    dark:bg-sky-400/10 dark:text-sky-300
                  `}
                >
                  {item.badge}
                </div>
              )
            : null}
        </a>
      ))}
      <div className="
        flex w-full items-center justify-center overflow-visible py-2
        dark:px-2
      "
      >
        <div className="group relative overflow-visible">
          <div
            className={`
              absolute -inset-2 rounded-[1rem]
              bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.26),rgba(139,92,246,0.18),transparent_72%)]
              opacity-90 blur-md transition duration-500
              group-hover:opacity-100
              dark:bg-[radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.16),rgba(139,92,246,0.34),transparent_72%)]
              dark:blur-lg
            `}
          />
          <button
            className={`
              relative overflow-hidden rounded-xl border border-sky-200/70
              bg-[linear-gradient(135deg,#f8fbff,#eef6ff_45%,#f5f3ff)] px-4 py-2
              font-semibold text-slate-800
              shadow-[0_14px_28px_rgba(56,189,248,0.16),inset_0_1px_0_rgba(255,255,255,0.88)]
              transition duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_18px_36px_rgba(99,102,241,0.22),inset_0_1px_0_rgba(255,255,255,0.92)]
              dark:border-fuchsia-400/20
              dark:bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92),rgba(49,46,129,0.88))]
              dark:text-slate-50
              dark:shadow-[0_16px_32px_rgba(76,29,149,0.34),inset_0_1px_0_rgba(255,255,255,0.08)]
              dark:hover:shadow-[0_20px_40px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
            `}
          >
            <div className="
              absolute inset-0
              bg-[linear-gradient(120deg,rgba(255,255,255,0.58),transparent_35%,transparent_68%,rgba(125,211,252,0.18))]
              dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_35%,transparent_68%,rgba(125,211,252,0.12))]
            "
            >
            </div>
            <Link
              className="
                relative z-10 text-inherit
                hover:text-inherit
              "
              to="/docs/sponsor"
            >
              成为赞助商
            </Link>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdsContainerElement
