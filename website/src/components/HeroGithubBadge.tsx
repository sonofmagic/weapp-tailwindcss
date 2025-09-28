import type { JSX } from 'react'
import React, { useEffect, useState } from 'react'

const GITHUB_REPO = 'sonofmagic/weapp-tailwindcss'
const CACHE_KEY = 'weapp-tailwindcss:github-stars'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

async function fetchStars(): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null
  }
  catch (error) {
    console.error('Failed to fetch GitHub stars', error)
    return null
  }
}

function readCache(): number | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const payload = window.sessionStorage.getItem(CACHE_KEY)
    if (!payload) {
      return null
    }

    const parsed = JSON.parse(payload) as { value: number, expires: number }
    if (Date.now() > parsed.expires) {
      return null
    }

    return parsed.value
  }
  catch (error) {
    console.warn('Failed to read cached GitHub stars', error)
    return null
  }
}

function writeCache(value: number) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const payload = JSON.stringify({ value, expires: Date.now() + CACHE_TTL })
    window.sessionStorage.setItem(CACHE_KEY, payload)
  }
  catch (error) {
    console.warn('Failed to cache GitHub stars', error)
  }
}

export default function HeroGithubBadge(): JSX.Element {
  const [stars, setStars] = useState<number | null>(() => readCache())

  useEffect(() => {
    if (stars != null) {
      return
    }

    let cancelled = false
    fetchStars().then((value) => {
      if (cancelled || value == null) {
        return
      }
      writeCache(value)
      setStars(value)
    })

    return () => {
      cancelled = true
    }
  }, [stars])

  return (
    <a
      className="group inline-flex items-center gap-2.5 rounded-full border border-transparent bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(236,249,255,0.72))] px-3.5 py-2 text-sm font-semibold tracking-[0.03em] text-slate-800 shadow-[0_18px_36px_rgba(14,165,233,0.22),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-[14px] transition-all duration-[400ms] hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(14,165,233,0.3),inset_0_1px_0_rgba(255,255,255,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.86),rgba(30,41,59,0.64))] dark:text-slate-200 dark:shadow-[0_18px_36px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] dark:hover:text-slate-100 dark:hover:shadow-[0_24px_52px_rgba(56,189,248,0.35),inset_0_1px_0_rgba(255,255,255,0.16)]"
      href="https://github.com/sonofmagic/weapp-tailwindcss"
      target="_blank"
      rel="noreferrer"
      aria-label="Star sonofmagic/weapp-tailwindcss on GitHub"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-7 items-center justify-center rounded-full bg-amber-400/20 text-amber-500 transition-[background,color] duration-300 group-hover:bg-amber-400/35 group-hover:text-amber-600 dark:bg-amber-400/25 dark:text-amber-200 dark:group-hover:bg-amber-400/40"
      >
        ★
      </span>
      <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] sm:inline">GitHub</span>
      <span className="min-w-0 text-right text-sm font-semibold tabular-nums sm:min-w-10">
        {stars != null ? stars.toLocaleString() : '—'}
      </span>
    </a>
  )
}
