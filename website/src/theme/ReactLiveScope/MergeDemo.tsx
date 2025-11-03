import type { CSSProperties } from 'react'
import { create } from '@weapp-tailwindcss/merge'
import { useMemo, useState } from 'react'
import { useHighlight } from './useHighlight'

export function MergeDemo() {
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

  const { twMerge } = runtime
  const x = twMerge(`
    bg-red px-2 py-1
    hover:bg-dark-red
  `, 'bg-[#B91C1C] p-3')
  const highlighted = useHighlight(x)
  const baseBackground = 'var(--ifm-color-emphasis-200, #f2f4f8)'
  const highlightBackground = 'var(--ifm-color-warning-contrast-background, #fff4ce)'
  const highlightBorder = 'var(--ifm-color-warning-contrast-foreground, #b45309)'
  const codeStyle: CSSProperties = {
    display: 'inline-block',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    background: highlighted ? highlightBackground : baseBackground,
    transition: 'background-color 0.45s ease, box-shadow 0.45s ease',
    boxShadow: highlighted ? `0 0 0 2px ${highlightBorder}` : 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  }

  return (
    <div>
      <div className="flex space-x-3">
        <div>
          参数 escape/unescape 禁用:
          {String(disableEscape)}
        </div>
        <div>
          <button onClick={() => setDisableEscape(!disableEscape)}>点我切换参数</button>
        </div>
      </div>
      <div className="space-x-3">
        <span>结果:</span>
        <code style={codeStyle}>{x}</code>
      </div>
    </div>
  )
}
