import type { JSX } from 'react'
import { useEffect, useState } from 'react'

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

  const baseClass = 'group inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0ea5e9]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0ea5e9] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
  return (
    <a
      href="https://www.npmjs.com/package/weapp-tailwindcss"
      target="_blank"
      rel="noreferrer"
      className={[baseClass, className ?? ''].filter(Boolean).join(' ')}
      aria-label="查看 weapp-tailwindcss 在 npm 的最新版本"
    >
      <i aria-hidden="true" className="icon-[mdi--package-variant-closed] text-[1.1rem] text-[#0ea5e9]"></i>
      <span className={`
        hidden text-xs font-semibold uppercase tracking-[0.14em]
        text-slate-500
        sm:inline
        dark:text-slate-400
      `}
      >
        Latest
      </span>
      <span className={`
        text-sm font-semibold tabular-nums text-slate-800
        dark:text-slate-100
      `}
      >
        {versionLabel}
      </span>
      {published && (
        <span className={`
          text-[0.7rem] font-medium uppercase tracking-[0.15em]
          text-slate-500
          dark:text-slate-400
        `}
        >
          {published}
        </span>
      )}
    </a>
  )
}
