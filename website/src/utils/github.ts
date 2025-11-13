import useIsBrowser from '@docusaurus/useIsBrowser'
import { useEffect, useState } from 'react'

export const GITHUB_CACHE_TTL = 1000 * 60 * 60 * 2 // 2 hours per requirement
const GITHUB_CACHE_PREFIX = 'weapp-tailwindcss:github-stars'
const SHIELDS_ENDPOINT = 'https://img.shields.io/github/stars'
const GITHUB_HTML_PROXY_ENDPOINT = 'https://r.jina.ai/https://github.com'

export interface UseGitHubStarsOptions {
  enabled?: boolean
}

export interface UseGitHubStarsResult {
  stars: number | null
  loading: boolean
}

interface ShieldsResponse {
  message?: string
}

function normalizeOwner(owner: string): string {
  return owner.trim()
}

function normalizeRepo(repo: string): string {
  return repo.trim()
}

export function buildRepoSlug(owner: string, repo: string): string {
  return `${normalizeOwner(owner)}/${normalizeRepo(repo)}`
}

export function buildStarCacheKey(owner: string, repo: string): string {
  return `${GITHUB_CACHE_PREFIX}:${buildRepoSlug(owner, repo)}`
}

function parseStarMessage(message?: string): number | null {
  if (!message) {
    return null
  }
  const normalized = message.trim().toLowerCase()
  if (!normalized) {
    return null
  }
  if (/^[\d,]+$/.test(normalized)) {
    return Number(normalized.replace(/,/g, ''))
  }
  const match = normalized.match(/^([\d.]+)\s*([kmb])$/)
  if (!match) {
    return null
  }
  const value = Number(match[1])
  if (Number.isNaN(value)) {
    return null
  }
  const unit = match[2]
  const multiplier = unit === 'k'
    ? 1_000
    : unit === 'm'
      ? 1_000_000
      : 1_000_000_000
  return Math.round(value * multiplier)
}

function escapeForRegex(value: string): string {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

function parseStarsFromGitHubPage(markdown: string, owner: string, repo: string): number | null {
  if (!markdown) {
    return null
  }
  const ownerPattern = escapeForRegex(normalizeOwner(owner))
  const repoPattern = escapeForRegex(normalizeRepo(repo))
  const regex = new RegExp(String.raw`\[([^\]]+?)\s+stars]\(https://github\.com/${ownerPattern}/${repoPattern}/stargazers\)`, 'i')
  const match = markdown.match(regex)
  if (!match) {
    return null
  }
  return parseStarMessage(match[1])
}

async function fetchRepoStarsViaShields(owner: string, repo: string): Promise<number | null> {
  try {
    const response = await fetch(`${SHIELDS_ENDPOINT}/${owner}/${repo}.json`)
    if (!response.ok) {
      console.warn(`fetchRepoStarsViaShields: shields.io responded with ${response.status} for ${owner}/${repo}`)
      return null
    }
    const data = await response.json() as ShieldsResponse
    return parseStarMessage(data.message)
  }
  catch (error) {
    console.warn(`fetchRepoStarsViaShields: failed to fetch for ${owner}/${repo}`, error)
    return null
  }
}

async function fetchRepoStarsViaGitHubPage(owner: string, repo: string): Promise<number | null> {
  try {
    const response = await fetch(`${GITHUB_HTML_PROXY_ENDPOINT}/${owner}/${repo}`)
    if (!response.ok) {
      console.warn(`fetchRepoStarsViaGitHubPage: proxy responded with ${response.status} for ${owner}/${repo}`)
      return null
    }
    const markdown = await response.text()
    return parseStarsFromGitHubPage(markdown, owner, repo)
  }
  catch (error) {
    console.warn(`fetchRepoStarsViaGitHubPage: failed to fetch for ${owner}/${repo}`, error)
    return null
  }
}

export async function fetchRepoStars(owner: string, repo: string): Promise<number | null> {
  const primary = await fetchRepoStarsViaShields(owner, repo)
  if (primary != null) {
    return primary
  }

  return fetchRepoStarsViaGitHubPage(owner, repo)
}

export function readStarCache(key: string): number | null {
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
    console.warn('readStarCache: failed to parse cached stars', error)
    return null
  }
}

export function writeStarCache(key: string, value: number): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const payload = JSON.stringify({ value, expires: Date.now() + GITHUB_CACHE_TTL })
    window.sessionStorage.setItem(key, payload)
  }
  catch (error) {
    console.warn('writeStarCache: failed to cache GitHub stars', error)
  }
}

function formatWithSuffix(value: number, suffix: string): string {
  const rounded = Number(value.toFixed(1))
  const text = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toString()
  return `${text}${suffix}`
}

export function formatGitHubStarCount(count?: number | null): string {
  if (count == null) {
    return '—'
  }
  if (count < 1_000) {
    return count.toLocaleString()
  }
  if (count >= 1_000_000_000) {
    return formatWithSuffix(count / 1_000_000_000, 'B')
  }
  if (count >= 1_000_000) {
    return formatWithSuffix(count / 1_000_000, 'M')
  }
  return formatWithSuffix(count / 1_000, 'k')
}

export function useGitHubStars(owner?: string, repo?: string, options?: UseGitHubStarsOptions): UseGitHubStarsResult {
  const isBrowser = useIsBrowser()
  const enabled = options?.enabled ?? true
  const cacheKey = owner && repo ? buildStarCacheKey(owner, repo) : null
  const [stars, setStars] = useState<number | null>(() => cacheKey ? readStarCache(cacheKey) : null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !isBrowser || !owner || !repo) {
      setLoading(false)
      return
    }

    const key = buildStarCacheKey(owner, repo)
    const cached = readStarCache(key)
    if (cached != null) {
      setStars(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetchRepoStars(owner, repo)
      .then((value) => {
        if (cancelled || value == null) {
          return
        }
        writeStarCache(key, value)
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
  }, [owner, repo, enabled, isBrowser])

  return {
    stars,
    loading,
  }
}
