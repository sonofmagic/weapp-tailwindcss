import type { CSSProperties } from 'react'
import { create } from '@weapp-tailwindcss/cva'
import { useMemo, useState } from 'react'
import { useHighlight } from './useHighlight'

const baseClass
  = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

const variantConfig = {
  variants: {
    tone: {
      primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]',
      outline: 'border border-border/60 bg-transparent text-[#1F2937]',
    },
    size: {
      sm: 'h-8 px-3',
      md: 'h-9 px-4',
      lg: 'h-10 px-6',
    },
  },
  defaultVariants: {
    tone: 'primary',
    size: 'md',
  },
} as const

type Tone = keyof typeof variantConfig.variants.tone
type Size = keyof typeof variantConfig.variants.size

export function CvaDemo() {
  const [tone, setTone] = useState<Tone>('primary')
  const [size, setSize] = useState<Size>('md')
  const [disableEscape, setDisableEscape] = useState(false)

  const runtime = useMemo(() => {
    if (disableEscape) {
      return create({
        escape: false,
        unescape: false,
      })
    }
    return create()
  }, [disableEscape])

  const button = useMemo(() => runtime.cva(baseClass, variantConfig), [runtime])
  const result = button({ tone, size })
  const highlighted = useHighlight(result)
  const baseBackground = 'var(--ifm-color-emphasis-200, #f2f4f8)'
  const highlightBackground = 'var(--ifm-color-warning-contrast-background, #fff4ce)'
  const highlightBorder = 'var(--ifm-color-warning-contrast-foreground, #b45309)'
  const codeStyle: CSSProperties = {
    display: 'block',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    background: highlighted ? highlightBackground : baseBackground,
    transition: 'background-color 0.45s ease, box-shadow 0.45s ease',
    boxShadow: highlighted ? `0 0 0 2px ${highlightBorder}` : 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  }

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)', fontSize: '0.95rem', display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="cva-tone">tone:</label>
          <select
            id="cva-tone"
            value={tone}
            onChange={event => setTone(event.target.value as Tone)}
          >
            {Object.keys(variantConfig.variants.tone).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label htmlFor="cva-size" style={{ marginLeft: '1rem' }}>size:</label>
          <select
            id="cva-size"
            value={size}
            onChange={event => setSize(event.target.value as Size)}
          >
            {Object.keys(variantConfig.variants.size).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={disableEscape}
            onChange={event => setDisableEscape(event.target.checked)}
          />
          禁用 escape/unescape
        </label>
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>输出类名</div>
        <code style={codeStyle}>{result}</code>
      </div>
    </div>
  )
}
