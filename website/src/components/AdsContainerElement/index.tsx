import Link from '@docusaurus/Link'
import Aizex from '@site/static/img/ads/aizex-mini.png'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'

function AdsContainerElement() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.ResizeObserver === 'undefined') {
      return
    }

    const element = containerRef.current
    if (!element) {
      return
    }

    const updateCompactState = (width: number) => {
      setIsCompact(width < 300)
    }

    updateCompactState(element.getBoundingClientRect().width)

    const observer = new window.ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        updateCompactState(entry.contentRect.width)
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="space-y-4 px-4">
      <div className={`
        flex w-full items-center
        dark:px-2
      `}
      >
        <div className="group relative">
          <div className={`
            absolute -inset-1 hidden rounded-lg bg-gradient-to-r from-rose-400
            via-fuchsia-500 to-indigo-500 opacity-75 blur transition
            duration-500
            group-hover:opacity-100
            dark:block
          `}
          >
          </div>
          <button className={`
            relative rounded-lg bg-[#f6f6f7] px-4 py-2 font-semibold text-white
            dark:bg-black
          `}
          >
            <Link to="/docs/sponsor">成为赞助商</Link>
          </button>
        </div>
      </div>

      <a
        className={clsx(
          `
            relative flex rounded-xl bg-[#f6f6f7] p-4
            shadow-[inset_0_0_0_1px_#ffffff1a]
            hover:no-underline
            dark:bg-[#1e293b]
          `,
          isCompact ? 'flex-col gap-3' : 'items-center justify-between',
        )}
        target="_blank"
        href="https://aizex.cn/0LcJ7G"
        rel="noopener sponsored nofollow"
      >
        <div className={clsx(
          'flex shrink-0 items-center',
          isCompact ? 'mb-2 justify-center' : 'mr-2',
        )}
        >
          <img className="h-14" src={Aizex} alt="aizex"></img>
        </div>
        <div className={clsx(
          'flex flex-col justify-around',
          isCompact ? 'self-auto text-center' : 'self-stretch',
        )}
        >
          <div className="mb-0.5 text-base font-semibold">
            Aizex 合租面板
          </div>
          <div className="text-xs text-[rgb(95,181,221)]">
            更好用的「GPT-5 x Claude」使用方式
          </div>

        </div>
        <div className={`
          absolute right-0 top-0 rounded-bl-md rounded-tr-xl bg-[#7dd3fc1a] p-1
          text-xs
          dark:text-[rgb(125,211,252)]
        `}
        >
          亲测推荐
        </div>
      </a>
    </div>
  )
}

export default AdsContainerElement
