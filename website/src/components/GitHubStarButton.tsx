import type { JSX } from 'react'
import useIsBrowser from '@docusaurus/useIsBrowser'
import React, { useEffect, useState } from 'react'

interface GitHubStarButtonProps {
  owner: string
  repo: string
  label?: string
  className?: string
}

const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

const buildCacheKey = (owner: string, repo: string) => `weapp-tailwindcss:github:${owner}/${repo}`

async function fetchStars(owner: string, repo: string): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    if (!response.ok) {
      return null
    }

    const data = await response.json() as { stargazers_count?: number }
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null
  }
  catch (error) {
    console.warn(`GitHubStarButton: failed to fetch ${owner}/${repo} stars`, error)
    return null
  }
}

function readCache(key: string): number | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const payload = window.sessionStorage.getItem(key)
    if (!payload) {
      return null
    }

    const parsed = JSON.parse(payload) as { value: number, expires: number }
    if (Date.now() > parsed.expires) {
      window.sessionStorage.removeItem(key)
      return null
    }

    return parsed.value
  }
  catch (error) {
    console.warn('GitHubStarButton: failed to read cache', error)
    return null
  }
}

function writeCache(key: string, value: number) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify({
      value,
      expires: Date.now() + CACHE_TTL,
    }))
  }
  catch (error) {
    console.warn('GitHubStarButton: failed to write cache', error)
  }
}

export default function GitHubStarButton(props: GitHubStarButtonProps): JSX.Element {
  const { owner, repo, label = 'Star', className } = props
  const isBrowser = useIsBrowser()
  const [stars, setStars] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isBrowser) {
      return
    }

    const cacheKey = buildCacheKey(owner, repo)
    const cached = readCache(cacheKey)
    if (cached != null) {
      setStars(cached)
      return
    }

    let cancelled = false
    setLoading(true)
    fetchStars(owner, repo)
      .then((value) => {
        if (cancelled || value == null) {
          return
        }
        writeCache(cacheKey, value)
        setStars(value)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [owner, repo, isBrowser])

  const displayCount = stars != null ? stars.toLocaleString() : loading ? '...' : '—'
  const repoLabel = `${owner}/${repo}`

  return (
    <a
      className={`
        inline-flex items-center gap-2 rounded-full border border-slate-200/70
        bg-white/80 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm
        ring-1 ring-slate-900/5 transition hover:border-slate-200
        hover:bg-white hover:text-slate-900 focus-visible:outline
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-sky-500 dark:border-slate-700/70
        dark:bg-slate-800/70 dark:text-slate-100 dark:hover:border-slate-600
        dark:hover:bg-slate-800 ${className ?? ''}
      `}
      href={`https://github.com/${owner}/${repo}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${repoLabel} on GitHub`}
      title={`GitHub: ${repoLabel}`}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-5 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-300"
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
      <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
        {label}
      </span>
      <span
        className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.8rem] font-semibold tabular-nums text-slate-800 dark:bg-slate-700 dark:text-slate-100"
        aria-live="polite"
      >
        {displayCount}
      </span>
    </a>
  )
}
