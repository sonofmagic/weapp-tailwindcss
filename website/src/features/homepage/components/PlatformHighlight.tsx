import type { FC, ReactNode } from 'react'
import Link from '@docusaurus/Link'
import { CoolTag } from './CoolTag'

export interface PlatformHighlightLink {
  href: string
  label: ReactNode
}

export interface PlatformHighlightProps {
  title: string
  tags: Array<{ id: string, content: ReactNode }>
  link: PlatformHighlightLink
}

export const PlatformHighlight: FC<PlatformHighlightProps> = ({ title, tags, link }) => {
  return (
    <section className="relative mt-8 w-full overflow-hidden rounded-3xl border border-slate-200/50 bg-white/85 px-6 py-7 text-center shadow-[0_20px_55px_rgba(14,165,233,0.16)] backdrop-blur-[18px] dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.25),transparent_70%)]"></div>
      <div className="absolute inset-x-10 top-0 -z-10 h-1 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-500 opacity-70"></div>
      <h4 className="mx-auto max-w-xl text-balance text-lg font-semibold text-slate-800 dark:text-slate-100">
        <span aria-hidden="true" className="mr-1">🔥</span>
        {title}
      </h4>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {tags.map(({ id, content }) => (
          <CoolTag className="min-w-[4.25rem]" key={id}>
            {content}
          </CoolTag>
        ))}
      </div>
      <Link
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors duration-300 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
        to={link.href}
      >
        {link.label}
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8h8m0 0-3-3m3 3-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
      </Link>
    </section>
  )
}
