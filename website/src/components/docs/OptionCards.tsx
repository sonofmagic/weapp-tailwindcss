import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type OptionCardProps = {
  id?: string
  title?: string
  children: ReactNode
  className?: string
}

export function OptionGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-6 md:gap-8', className)}>
      {children}
    </div>
  )
}

export function OptionCard({ id, title, children, className }: OptionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        'group scroll-mt-28 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur',
        'mt-4 mb-8',
        'dark:border-slate-700/60 dark:bg-slate-900/60',
        className,
      )}
    >
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {id ? (
              <a className="no-underline hover:text-sky-600 dark:hover:text-sky-400" href={`#${id}`}>
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
        </div>
      ) : null}
      <div className="mt-3 space-y-4 text-sm text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  )
}

export function OptionMeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-xs', className)}>{children}</div>
  )
}

type OptionMetaItemProps = {
  label: string
  children: ReactNode
  tone?: 'default' | 'accent' | 'muted'
}

const metaToneClassName: Record<NonNullable<OptionMetaItemProps['tone']>, string> = {
  default:
    'border-slate-200/70 bg-slate-50 text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200',
  accent:
    'border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-950/60 dark:text-sky-200',
  muted:
    'border-slate-200/60 bg-white text-slate-500 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-slate-400',
}

export function OptionMetaItem({ label, children, tone = 'default' }: OptionMetaItemProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium leading-none',
        metaToneClassName[tone],
      )}
    >
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-slate-900 dark:text-slate-100">{children}</span>
    </span>
  )
}

type OptionDetailsProps = {
  title: string
  children: ReactNode
  className?: string
}

export function OptionDetails({ title, children, className }: OptionDetailsProps) {
  return (
    <div
      className={cn(
        'group/details rounded-xl border border-slate-200/70 bg-slate-50/70 p-4',
        'dark:border-slate-700/60 dark:bg-slate-800/40',
        className,
      )}
    >
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</div>
      <div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  )
}

type OptionHintProps = {
  children: ReactNode
  className?: string
}

export function OptionHint({ children, className }: OptionHintProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-sky-200/70 bg-sky-50 px-4 py-3 text-sm text-sky-900',
        'dark:border-sky-500/40 dark:bg-sky-950/60 dark:text-sky-100',
        className,
      )}
    >
      {children}
    </div>
  )
}

type OptionTableProps = {
  children: ReactNode
  className?: string
}

export function OptionTable({ children, className }: OptionTableProps) {
  return (
    <div
      className={cn(
        'my-3 overflow-x-auto',
        '[&_table]:w-full [&_table]:border-collapse',
        '[&_thead]:border-b [&_thead]:border-slate-200 [&_thead]:text-slate-600',
        '[&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide',
        '[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:last-child]:border-b-0',
        '[&_td]:py-2 [&_td]:align-top [&_td]:text-sm',
        '[&_code]:text-slate-700 dark:[&_code]:text-slate-200',
        'dark:[&_thead]:border-slate-700 dark:[&_thead]:text-slate-300',
        'dark:[&_tbody_tr]:border-slate-800',
        className,
      )}
    >
      {children}
    </div>
  )
}
