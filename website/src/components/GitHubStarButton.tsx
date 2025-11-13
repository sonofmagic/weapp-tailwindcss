import type { JSX } from 'react'
import React from 'react'
import { useGitHubStars } from '../utils/github'

interface GitHubStarButtonProps {
  owner: string
  repo: string
  label?: string
  className?: string
}

export default function GitHubStarButton(props: GitHubStarButtonProps): JSX.Element {
  const { owner, repo, label = 'Star', className } = props
  const { stars, loading } = useGitHubStars(owner, repo)

  const displayCount = stars != null ? stars.toLocaleString() : loading ? '...' : '—'
  const repoLabel = `${owner}/${repo}`

  return (
    <a
      className={`
        inline-flex items-center gap-2 rounded-full border border-slate-200/70
        bg-white/80 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm
        ring-1 ring-slate-900/5 transition
        hover:border-slate-200 hover:bg-white hover:text-slate-900
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-sky-500
        dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-100
        dark:hover:border-slate-600 dark:hover:bg-slate-800
        ${className ?? ''}
      `}
      href={`https://github.com/${owner}/${repo}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${repoLabel} on GitHub`}
      title={`GitHub: ${repoLabel}`}
    >
      <span
        aria-hidden="true"
        className={`
          inline-flex size-5 items-center justify-center rounded-full
          bg-yellow-100 text-yellow-600
          dark:bg-yellow-500/20 dark:text-yellow-300
        `}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2.75l2.49 5.05 5.58.81-4.04 3.94.95 5.54-4.98-2.62-4.98 2.62.95-5.54L3.93 8.61l5.58-.81L12 2.75z" />
        </svg>
      </span>
      <span className={`
        text-xs uppercase tracking-wide text-slate-500
        dark:text-slate-300
      `}
      >
        {label}
      </span>
      <span
        className={`
          rounded-full bg-slate-100 px-2 py-0.5 text-[0.8rem] font-semibold
          tabular-nums text-slate-800
          dark:bg-slate-700 dark:text-slate-100
        `}
        aria-live="polite"
      >
        {displayCount}
      </span>
    </a>
  )
}
