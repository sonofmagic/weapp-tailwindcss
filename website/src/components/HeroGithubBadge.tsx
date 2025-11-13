import type { JSX } from 'react'
import React from 'react'
import { formatGitHubStarCount, useGitHubStars } from '../utils/github'

const GITHUB_OWNER = 'sonofmagic'
const GITHUB_REPO = 'weapp-tailwindcss'

export default function HeroGithubBadge(): JSX.Element {
  const { stars } = useGitHubStars(GITHUB_OWNER, GITHUB_REPO)
  const displayStars = formatGitHubStarCount(stars)

  return (
    <a
      className={`
        group inline-flex items-center gap-3 rounded-full border
        border-transparent
        bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(236,248,255,0.74))]
        px-2.5 py-1.5 text-sm font-semibold tracking-[0.045em] text-slate-900
        shadow-[0_18px_42px_rgba(14,165,233,0.24),0_10px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.94)]
        backdrop-blur-[18px] transition-all duration-[360ms]
        hover:-translate-y-0.5
        hover:shadow-[0_24px_56px_rgba(14,165,233,0.32),0_14px_30px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.97)]
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-sky-400
        dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.68))]
        dark:text-slate-200
        dark:shadow-[0_20px_44px_rgba(15,23,42,0.36),inset_0_1px_0_rgba(255,255,255,0.14)]
        dark:hover:text-slate-100
        dark:hover:shadow-[0_26px_58px_rgba(56,189,248,0.32),inset_0_1px_0_rgba(255,255,255,0.18)]
      `}
      href="https://github.com/sonofmagic/weapp-tailwindcss"
      target="_blank"
      rel="noreferrer"
      aria-label="Star sonofmagic/weapp-tailwindcss on GitHub"
    >
      <span
        aria-hidden="true"
        className={`
          relative inline-flex size-8 items-center justify-center rounded-full
          text-amber-500 transition-[transform,color] duration-300
          group-hover:text-amber-400
        `}
      >
        <span
          className={`
            absolute inset-0 rounded-full
            bg-[conic-gradient(from_160deg_at_50%_50%,rgba(250,204,21,0.5),rgba(253,224,71,0.28),rgba(245,158,11,0.48))]
            opacity-75 blur-md transition-opacity duration-300
            group-hover:opacity-95
          `}
          aria-hidden="true"
        >
        </span>
        <span className={`
          relative inline-flex size-8 items-center justify-center rounded-full
          border border-amber-400/40 bg-white/70 text-[1rem] font-semibold
          shadow-[0_4px_12px_rgba(251,191,36,0.32)]
          group-hover:rotate-6
          dark:border-amber-300/30 dark:bg-amber-500/20 dark:text-amber-200
        `}
        >
          ★
        </span>
      </span>
      <span className={`
        hidden text-xs font-semibold uppercase tracking-[0.165em] text-sky-600
        sm:inline
        dark:text-sky-300
      `}
      >
        GitHub
      </span>
      <span className={`
        min-w-[2.8rem] text-right text-sm font-semibold tabular-nums
        text-slate-800
        sm:min-w-[3.6rem]
        dark:text-slate-100
      `}
      >
        {displayStars}
      </span>
    </a>
  )
}
