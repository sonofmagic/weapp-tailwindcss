import type { FC, ReactNode } from 'react'
import Link from '@docusaurus/Link'

export interface PlatformHighlightLink {
  href: string
  label: ReactNode
}

export interface PlatformHighlightProps {
  title: string
  tags: Array<{ id: string, label: string, content: ReactNode }>
  link: PlatformHighlightLink
}

export const PlatformHighlight: FC<PlatformHighlightProps> = ({ title, tags, link }) => {
  return (
    <section
      aria-label={title}
      className={`
        relative mt-8 w-full overflow-hidden rounded-[32px] border
        border-slate-200/40 bg-white/85 px-5 py-6
        shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-[18px]
        dark:border-white/10 dark:bg-slate-900/65 dark:text-slate-100
      `}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.1),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.2),transparent_65%)]"></div>
      <div className="mb-5 flex items-center justify-between">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-200/80 to-sky-200/70 text-2xl"
        >
          🔥
        </span>
        <Link
          aria-label={typeof link.label === 'string' ? link.label : undefined}
          className={`
            inline-flex size-11 items-center justify-center rounded-full border
            border-white/70 text-slate-600 transition-colors duration-200
            hover:text-slate-900 dark:border-white/20 dark:text-slate-100
          `}
          to={link.href}
        >
          <span className="sr-only">{link.label}</span>
          <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10h8m0 0-3-3m3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
          </svg>
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {tags.map(({ id, label, content }) => (
          <div
            aria-label={label}
            className={`
              flex size-14 items-center justify-center rounded-2xl border
              border-white/60 bg-white/90 text-2xl shadow-[0_12px_40px_rgba(15,23,42,0.12)]
              dark:border-white/5 dark:bg-slate-800/70
            `}
            key={id}
            role="img"
            title={label}
          >
            <span className="sr-only">{label}</span>
            {content}
          </div>
        ))}
      </div>
    </section>
  )
}
