import type { JSX, ReactNode } from 'react'
import React from 'react'
import GitHubStarButton from './GitHubStarButton'

interface TemplateLinkProps {
  title: string
  href: string
  repoOwner?: string
  repo?: string
  hot?: boolean
  deprecated?: boolean
  badge?: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}

export default function TemplateLink(props: TemplateLinkProps): JSX.Element {
  const {
    title,
    href,
    repoOwner,
    repo,
    hot,
    deprecated,
    badge,
    description,
    children,
    className,
  } = props
  const detail = description ?? children
  const variant = deprecated ? 'deprecated' : hot ? 'recommended' : 'default'
  const badgeContent = badge
    ?? (variant === 'deprecated'
      ? '⚠️ 不推荐'
      : variant === 'recommended'
        ? '🔥 推荐'
        : '✅ 可用')
  const baseClass = `
    mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl
    p-4 transition duration-300
    hover:-translate-y-0.5
  `
  const variantClass = {
    deprecated: `
      border border-rose-200/80 bg-gradient-to-br from-white via-rose-50/80
      to-rose-100/80 shadow-[0_12px_32px_rgba(184,63,94,0.18)]
      hover:border-rose-300/80 hover:shadow-[0_18px_44px_rgba(184,63,94,0.35)]
      dark:border-rose-900/60 dark:from-rose-950/40 dark:via-rose-950/30
      dark:to-rose-950/10
      dark:shadow-[0_18px_40px_rgba(185,35,65,0.5)]
    `,
    recommended: `
      border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50
      to-emerald-100 shadow-[0_12px_32px_rgba(16,185,129,0.18)]
      hover:border-emerald-300/80 hover:shadow-[0_18px_44px_rgba(16,185,129,0.35)]
      dark:border-emerald-900/60 dark:from-emerald-950/40 dark:via-emerald-950/30
      dark:to-emerald-900/10
      dark:shadow-[0_18px_40px_rgba(16,185,129,0.4)]
    `,
    default: `
      border border-sky-200/80 bg-gradient-to-br from-white via-sky-50
      to-slate-50 shadow-[0_12px_32px_rgba(14,165,233,0.15)]
      hover:border-sky-300/80 hover:shadow-[0_18px_44px_rgba(14,165,233,0.28)]
      dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800
      dark:to-slate-900/40 dark:shadow-[0_18px_40px_rgba(0,0,0,0.6)]
    `,
  }[variant]
  const badgeBgClass = {
    deprecated: `
      bg-rose-100 text-rose-700
      dark:bg-rose-400/10 dark:text-rose-200
    `,
    recommended: `
      bg-emerald-100 text-emerald-700
      dark:bg-emerald-400/10 dark:text-emerald-200
    `,
    default: `
      bg-sky-100 text-sky-700
      dark:bg-sky-400/10 dark:text-sky-200
    `,
  }[variant]

  return (
    <div
      className={`
        ${baseClass}
        ${variantClass}
        ${className ?? ''}
      `}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <a
          className={`
            group inline-flex items-center gap-2 text-base font-semibold
            text-slate-900 no-underline
            dark:text-slate-100
          `}
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {badgeContent && (
            <span className={`
              inline-flex items-center rounded-full px-2 py-0.5
              text-xs font-semibold
              ${badgeBgClass}
            `}
            >
              {badgeContent}
            </span>
          )}
          <span className="truncate">
            {title}
          </span>
          <svg
            className={`
              size-4 text-slate-400 transition
              group-hover:translate-x-0.5 group-hover:text-slate-600
              dark:text-slate-500 dark:group-hover:text-slate-300
            `}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M5.5 3.5h7v7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.5 3.5 3.5 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        {detail && (
          <div className={`
            text-sm text-slate-500
            dark:text-slate-300
          `}
          >
            {detail}
          </div>
        )}
      </div>
      {repoOwner && repo
        ? (
            <GitHubStarButton
              owner={repoOwner}
              repo={repo}
              className="ml-auto"
            />
          )
        : null}
    </div>
  )
}
