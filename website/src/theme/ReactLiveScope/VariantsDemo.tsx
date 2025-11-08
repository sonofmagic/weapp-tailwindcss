import type { CSSProperties } from 'react'
import { create } from '@weapp-tailwindcss/variants'
import { useMemo, useState } from 'react'
import { useHighlight } from './useHighlight'

const badgeConfig = {
  base: 'inline-flex items-center rounded-full px-2 text-xs font-semibold',
  variants: {
    tone: {
      neutral: 'bg-[#F4F4F5] text-[#18181B]',
      success: 'bg-[#DCFCE7] text-[#166534]',
      danger: 'bg-[#FEE2E2] text-[#B91C1C]',
    },
    soft: {
      true: 'bg-opacity-75',
    },
  },
  compoundVariants: [
    {
      tone: 'danger',
      soft: true,
      class: 'bg-[#F87171] text-white',
    },
  ],
  defaultVariants: {
    tone: 'neutral',
  },
} as const

type Tone = keyof typeof badgeConfig.variants.tone

export function VariantsDemo() {
  const [tone, setTone] = useState<Tone>('neutral')
  const [soft, setSoft] = useState(false)
  const [mergeEnabled, setMergeEnabled] = useState(true)
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

  const tv = useMemo(() => runtime.tv(badgeConfig), [runtime])
  const badgeClassName = tv({ tone, soft, twMerge: mergeEnabled })

  const cnAggregator = useMemo(
    () => runtime.cn('text-[#ececec]', 'text-[#ECECEC]'),
    [runtime],
  )

  const mergedCn = cnAggregator({ twMerge: mergeEnabled })
  const rawCn = cnAggregator({ twMerge: false })
  const highlightTv = useHighlight(badgeClassName)
  const highlightMerged = useHighlight(mergedCn)
  const highlightRaw = useHighlight(rawCn)

  const baseBackground = 'var(--ifm-color-emphasis-200, #f2f4f8)'
  const highlightBackground = 'var(--ifm-color-warning-contrast-background, #fff4ce)'
  const highlightBorder = 'var(--ifm-color-warning-contrast-foreground, #b45309)'

  const blockStyle = (active: boolean): CSSProperties => ({
    display: 'block',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    background: active ? highlightBackground : baseBackground,
    transition: 'background-color 0.45s ease, box-shadow 0.45s ease',
    boxShadow: active ? `0 0 0 2px ${highlightBorder}` : 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  })

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)', fontSize: '0.95rem', display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <label htmlFor="variant-tone">tone:</label>
          <select
            id="variant-tone"
            value={tone}
            onChange={event => setTone(event.target.value as Tone)}
          >
            {Object.keys(badgeConfig.variants.tone).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={soft}
              onChange={event => setSoft(event.target.checked)}
            />
            软色（soft）
          </label>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={mergeEnabled}
            onChange={event => setMergeEnabled(event.target.checked)}
          />
          开启 twMerge 去重
        </label>
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
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>tv 输出</div>
        <code style={blockStyle(highlightTv)}>{badgeClassName}</code>
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>cn 合并结果</div>
        <code style={blockStyle(highlightMerged)}>{mergedCn}</code>
        <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)' }}>
          关闭 twMerge 时：
        </div>
        <code style={{ ...blockStyle(highlightRaw), marginTop: '0.25rem' }}>{rawCn}</code>
      </div>
    </div>
  )
}
