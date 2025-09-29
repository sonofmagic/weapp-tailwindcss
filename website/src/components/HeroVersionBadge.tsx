import type { JSX } from 'react'
import React, { useEffect, useState } from 'react'

const PACKAGE_NAME = 'weapp-tailwindcss'
const CACHE_KEY = `${PACKAGE_NAME}:latest-version`
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

interface VersionPayload {
  version: string | null
  publishedAt: string | null
}

async function fetchLatestVersion(): Promise<VersionPayload> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`)
    if (!response.ok) {
      return { version: null, publishedAt: null }
    }

    const data = await response.json() as { version?: string, time?: { modified?: string } }
    return {
      version: typeof data.version === 'string' ? data.version : null,
      publishedAt: data.time?.modified ?? null,
    }
  }
  catch (error) {
    console.error('Failed to fetch latest npm version', error)
    return { version: null, publishedAt: null }
  }
}

function readCache(): VersionPayload | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const payload = window.sessionStorage.getItem(CACHE_KEY)
    if (!payload) {
      return null
    }

    const parsed = JSON.parse(payload) as { expires: number, value: VersionPayload }
    if (Date.now() > parsed.expires) {
      return null
    }
    return parsed.value
  }
  catch (error) {
    console.warn('Failed to read cached npm version', error)
    return null
  }
}

function writeCache(value: VersionPayload) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const payload = JSON.stringify({ value, expires: Date.now() + CACHE_TTL })
    window.sessionStorage.setItem(CACHE_KEY, payload)
  }
  catch (error) {
    console.warn('Failed to cache npm version', error)
  }
}

function formatPublished(label: string | null) {
  if (!label) {
    return null
  }

  try {
    const date = new Date(label)
    if (Number.isNaN(date.getTime())) {
      return null
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }
  catch (error) {
    console.warn('Failed to format publish date', error)
    return null
  }
}

interface HeroVersionBadgeProps {
  className?: string
}

export default function HeroVersionBadge({ className }: HeroVersionBadgeProps = {}): JSX.Element {
  const [data, setData] = useState<VersionPayload>(() => readCache() ?? { version: null, publishedAt: null })

  useEffect(() => {
    if (data.version) {
      return
    }

    let cancelled = false
    fetchLatestVersion().then((value) => {
      if (cancelled) {
        return
      }
      if (value.version) {
        writeCache(value)
      }
      setData(value)
    })

    return () => {
      cancelled = true
    }
  }, [data.version])

  const published = formatPublished(data.publishedAt)
  const versionLabel = data.version ? `v${data.version}` : 'v—'

  const baseClass = 'group inline-flex items-center gap-2.75 rounded-full border border-emerald-500/10 bg-[linear-gradient(140deg,rgba(209,250,229,0.6),rgba(167,243,208,0.38),rgba(226,252,236,0.3))] pl-3.25 pr-4 py-2.35 text-sm font-semibold tracking-[0.028em] text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.14),0_7px_18px_rgba(15,23,42,0.08)] backdrop-blur-[14px] transition-all duration-[320ms] hover:-translate-y-0.3 hover:shadow-[0_18px_40px_rgba(16,185,129,0.2),0_10px_24px_rgba(15,23,42,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 dark:border-emerald-400/14 dark:bg-[linear-gradient(140deg,rgba(8,60,54,0.56),rgba(14,116,67,0.44))] dark:text-emerald-200 dark:shadow-[0_16px_28px_rgba(16,185,129,0.18)]'
  return (
    <a
      href="https://www.npmjs.com/package/weapp-tailwindcss"
      target="_blank"
      rel="noreferrer"
      className={[baseClass, 'hover:-translate-y-0.3 hover:scale-[1.01] active:translate-y-0 focus-visible:ring focus-visible:ring-emerald-200/60 dark:hover:scale-[1.005] dark:hover:-translate-y-0.2', className ?? ''].filter(Boolean).join(' ')}
      aria-label="查看 weapp-tailwindcss 在 npm 的最新版本"
    >
      <span className="relative inline-flex size-[1.9rem] shrink-0 translate-x-0 items-center justify-center">
        <span className="bg-emerald-400/18 absolute inset-0 rounded-full opacity-50 blur transition-opacity duration-300 group-hover:opacity-75" aria-hidden="true"></span>
        <span className="relative inline-flex size-[1.9rem] items-center justify-center rounded-full border border-transparent bg-[radial-gradient(circle,rgba(16,185,129,0.2),rgba(134,239,172,0.16))] text-[0.72rem] font-semibold text-emerald-600 shadow-[0_2px_7px_rgba(16,185,129,0.14)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.22),rgba(6,95,70,0.22))] dark:text-emerald-100">
          ●
        </span>
      </span>
      <span className="hidden text-xs font-semibold uppercase tracking-[0.11em] text-emerald-500/85 sm:inline dark:text-emerald-200/80">
        Latest
      </span>
      <span className="ml-1.5 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-100">
        {versionLabel}
      </span>
      {published && (
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-emerald-500/65 dark:text-emerald-200/60">
          {published}
        </span>
      )}
    </a>
  )
}
