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
      className="group inline-flex items-center gap-3 rounded-full border border-transparent bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(236,248,255,0.74))] px-2.5 py-1.5 text-sm font-semibold tracking-[0.045em] text-slate-900 shadow-[0_18px_42px_rgba(14,165,233,0.24),0_10px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.94)] backdrop-blur-[18px] transition-all duration-[360ms] hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(14,165,233,0.32),0_14px_30px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.97)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.68))] dark:text-slate-200 dark:shadow-[0_20px_44px_rgba(15,23,42,0.36),inset_0_1px_0_rgba(255,255,255,0.14)] dark:hover:text-slate-100 dark:hover:shadow-[0_26px_58px_rgba(56,189,248,0.32),inset_0_1px_0_rgba(255,255,255,0.18)]"
      href="https://github.com/sonofmagic/weapp-tailwindcss"
      target="_blank"
      rel="noreferrer"
      aria-label="Star sonofmagic/weapp-tailwindcss on GitHub"
    >
      <span
        aria-hidden="true"
        className="duration-400 relative inline-flex size-8 items-center justify-center rounded-full text-amber-500 transition-[transform,color] group-hover:text-amber-400"
      >
        <span className="duration-400 absolute inset-0 rounded-full bg-[conic-gradient(from_160deg_at_50%_50%,rgba(250,204,21,0.5),rgba(253,224,71,0.28),rgba(245,158,11,0.48))] opacity-75 blur-md transition-opacity group-hover:opacity-95" aria-hidden="true"></span>
        <span className="
        relative inline-flex size-8 items-center justify-center rounded-full border border-amber-400/40 bg-white/70 text-[1rem] font-semibold shadow-[0_4px_12px_rgba(251,191,36,0.32)] group-hover:rotate-6 dark:border-amber-300/30 dark:bg-amber-500/20 dark:text-amber-200"
        >
          ★
        </span>
      </span>
      <span className="hidden text-xs font-semibold uppercase tracking-[0.165em] text-sky-600 sm:inline dark:text-sky-300">
        GitHub
      </span>
      <span className="min-w-[2.8rem] text-right text-sm font-semibold tabular-nums text-slate-800 sm:min-w-[3.6rem] dark:text-slate-100">
        {stars != null ? stars.toLocaleString() : '—'}
      </span>
    </a>
  )
}
