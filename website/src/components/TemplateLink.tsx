import type { JSX, ReactNode } from 'react'
import React from 'react'
import GitHubStarButton from './GitHubStarButton'

interface TemplateLinkProps {
  title: string
  href: string
  repoOwner?: string
  repo?: string
  hot?: boolean
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
    badge,
    description,
    children,
    className,
  } = props
  const detail = description ?? children
  const badgeContent = badge ?? (hot ? '🔥 推荐' : null)

  return (
    <div
      className={`
        mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl
        border border-slate-200/80 bg-gradient-to-br from-white via-white
        to-slate-50/50 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition
        duration-300
        hover:-translate-y-0.5 hover:border-slate-200
        hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)]
        dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800
        dark:to-slate-900/40 dark:shadow-[0_18px_40px_rgba(0,0,0,0.6)]
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
              inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5
              text-xs font-semibold text-amber-700
              dark:bg-amber-400/10 dark:text-amber-200
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
