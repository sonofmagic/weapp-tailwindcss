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
      className="hero-github-badge"
      href="https://github.com/sonofmagic/weapp-tailwindcss"
      target="_blank"
      rel="noreferrer"
      aria-label="Star sonofmagic/weapp-tailwindcss on GitHub"
    >
      <span className="hero-github-badge__icon" aria-hidden="true">
        ★
      </span>
      <span className="hero-github-badge__label">GitHub</span>
      <span className="hero-github-badge__count">
        {stars != null ? stars.toLocaleString() : '—'}
      </span>
    </a>
  )
}
