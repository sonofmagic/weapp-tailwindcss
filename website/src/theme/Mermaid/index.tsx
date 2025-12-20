import type { Props } from '@theme/Mermaid'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import OriginalMermaid from '@theme-original/Mermaid'
import clsx from 'clsx'
import { deflateRaw } from 'pako'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import styles from './styles.module.css'

const MERMAID_LIVE = 'https://mermaid.live/edit'

function bufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

async function encodeForMermaidLive(code: string) {
  if (typeof CompressionStream !== 'undefined') {
    try {
      const encoder = new TextEncoder()
      const stream = new CompressionStream('deflate')
      const writer = stream.writable.getWriter()
      await writer.write(encoder.encode(code))
      await writer.close()
      const compressed = await new Response(stream.readable).arrayBuffer()
      return `${MERMAID_LIVE}#pako:${bufferToBase64(compressed)}`
    }
    catch {
      // fall through to pako
    }
  }

  try {
    const compressed = deflateRaw(code)
    return `${MERMAID_LIVE}#pako:${bufferToBase64(compressed.buffer)}`
  }
  catch {
    return undefined
  }
}

export default function MermaidWithToolbar({ value, ...rest }: Props) {
  const { siteConfig } = useDocusaurusContext()
  const wheelZoomEnabled = Boolean((siteConfig as any)?.customFields?.mermaidWheelZoom)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const diagramRef = useRef<HTMLDivElement | null>(null)
  const [copied, setCopied] = useState(false)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const startRef = useRef<{ x: number, y: number, ox: number, oy: number } | null>(null)
  const centeredRef = useRef(false)
  const readyRef = useRef(false)
  const liveHref = useRef<string>(MERMAID_LIVE)
  const markReady = useCallback(() => {
    if (!readyRef.current) {
      readyRef.current = true
      setIsReady(true)
    }
  }, [])
  const estimatedHeight = useMemo(() => {
    const lines = value.split('\n').filter(line => line.trim().length > 0).length
    const height = lines * 26 + 140
    return Math.max(260, Math.min(height, 760))
  }, [markReady, value])

  useEffect(() => {
    let cancelled = false
    encodeForMermaidLive(value).then((url) => {
      if (!cancelled && url) {
        liveHref.current = url
      }
    })
    return () => {
      cancelled = true
    }
  }, [value])

  // Fallback: even在极慢渲染或观察失效时也确保展示内容
  useEffect(() => {
    const timer = window.setTimeout(() => markReady(), 800)
    return () => window.clearTimeout(timer)
  }, [markReady, value])

  useEffect(() => {
    const applySize = (content: HTMLDivElement, svg: SVGSVGElement) => {
      const viewBox = svg.getAttribute('viewBox')
      if (viewBox) {
        const parts = viewBox.split(/\s+/).map(Number)
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          content.style.width = `${parts[2]}px`
          content.style.height = `${parts[3]}px`
          return true
        }
      }
      if (typeof svg.getBBox === 'function') {
        const box = svg.getBBox()
        if (box.width > 0 && box.height > 0) {
          content.style.width = `${box.width}px`
          content.style.height = `${box.height}px`
          return true
        }
      }
      return false
    }

    let cleanup: (() => void) | undefined
    let observerCleanup: (() => void) | undefined
    let fallbackTimer: number | undefined
    const tryAttach = () => {
      const content = contentRef.current
      const svg = content?.querySelector('svg')
      if (!content || !svg) {
        return false
      }
      markReady()
      const updated = applySize(content, svg)

      if (!centeredRef.current && containerRef.current && diagramRef.current) {
        requestAnimationFrame(() => {
          if (centeredRef.current || !containerRef.current || !contentRef.current || !diagramRef.current) {
            return
          }
          const viewport = diagramRef.current.getBoundingClientRect()
          const contentRect = contentRef.current.getBoundingClientRect()

          const nextX = 0
          const nextY = contentRect.height < viewport.height ? (viewport.height - contentRect.height) / 2 : 0
          setOffset({ x: nextX, y: nextY })

          const scaledHeight = contentRect.height * scale
          diagramRef.current.scrollLeft = 0
          if (scaledHeight > viewport.height) {
            diagramRef.current.scrollTop = (scaledHeight - viewport.height) / 2
          }

          centeredRef.current = true
        })
      }

      const ro = new ResizeObserver(() => applySize(content, svg))
      ro.observe(svg)
      cleanup = () => ro.disconnect()
      return updated
    }

    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      const ok = tryAttach()
      if (ok || attempts > 25) {
        window.clearInterval(timer)
        // 如果定时探测未命中，在节点异步插入较慢时再用 MutationObserver 捕获
        if (!ok && !readyRef.current) {
          const content = contentRef.current
          if (content) {
            const mo = new MutationObserver(() => {
              const ready = tryAttach()
              if (ready) {
                mo.disconnect()
              }
            })
            mo.observe(content, { childList: true, subtree: true })
            observerCleanup = () => mo.disconnect()
            // 兜底：长时间仍未触发时也标记为 ready，避免永远透明
            fallbackTimer = window.setTimeout(() => {
              if (!readyRef.current) {
                const ok2 = tryAttach()
                if (!ok2) {
                  markReady()
                }
              }
            }, 4000)
          }
        }
      }
    }, 80)
    return () => {
      window.clearInterval(timer)
      if (cleanup) {
        cleanup()
      }
      if (observerCleanup) {
        observerCleanup()
      }
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer)
      }
    }
  }, [value])

  useEffect(() => {
    const content = contentRef.current
    if (!content) {
      return
    }
    content.style.transform = `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
    content.style.transformOrigin = '0 0'
    content.style.transition = isPanning ? 'opacity 160ms ease' : 'opacity 160ms ease, transform 120ms ease'
    content.style.cursor = isPanning ? 'grabbing' : 'grab'
  }, [scale, offset, isPanning])

  const handleCopy = useCallback(async () => {
    const markDone = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }
    try {
      await navigator.clipboard.writeText(value)
      markDone()
    }
    catch {
      // fallback for http/non-secure contexts
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.style.position = 'fixed'
      textarea.style.top = '-9999px'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      try {
        document.execCommand('copy')
        markDone()
      }
      catch {
        setCopied(false)
      }
      finally {
        document.body.removeChild(textarea)
      }
    }
  }, [value])

  const handleDownload = useCallback(() => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) {
      return
    }
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.svg'
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return
      }
      if ((event.target as HTMLElement).closest?.(`.${styles.toolbar}`)) {
        return
      }
      setIsPanning(true)
      startRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y }
    },
    [offset.x, offset.y],
  )

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !startRef.current) {
      return
    }
    const { x, y, ox, oy } = startRef.current
    setOffset({ x: ox + (event.clientX - x), y: oy + (event.clientY - y) })
  }, [isPanning])

  const endPan = useCallback(() => {
    setIsPanning(false)
    startRef.current = null
  }, [])

  const zoomIn = useCallback(() => setScale(v => Math.min(2.5, +(v + 0.1).toFixed(2))), [])
  const zoomOut = useCallback(() => setScale(v => Math.max(0.5, +(v - 0.1).toFixed(2))), [])
  const resetView = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!wheelZoomEnabled) {
        return
      }
      if (event.ctrlKey) {
        return
      }
      event.preventDefault()
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      setScale((v) => {
        const next = Math.min(2.5, Math.max(0.5, +(v + delta).toFixed(2)))
        return next
      })
    },
    [wheelZoomEnabled],
  )

  useEffect(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
    centeredRef.current = false
    readyRef.current = false
    setIsReady(false)
  }, [value])

  const renderToolbar = useMemo(
    () => (
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button className={styles.toolButton} type="button" onClick={zoomOut} aria-label="缩小">-</button>
          <span className={styles.scaleText}>
            {Math.round(scale * 100)}
            %
          </span>
          <button className={styles.toolButton} type="button" onClick={zoomIn} aria-label="放大">+</button>
          <button className={styles.toolButton} type="button" onClick={resetView} aria-label="重置视图">重置</button>
        </div>
        <div className={styles.toolGroup}>
          <button className={styles.toolButton} type="button" onClick={handleCopy}>
            {copied ? '已复制' : '复制源码'}
          </button>
          <button className={styles.toolButton} type="button" onClick={handleDownload}>
            下载 SVG
          </button>
          <a className={styles.toolButton} href={liveHref.current} target="_blank" rel="noreferrer">
            Mermaid Live
          </a>
        </div>
      </div>
    ),
    [copied, handleCopy, handleDownload, resetView, scale, zoomIn, zoomOut],
  )

  return (
    <div
      className={styles.wrapper}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endPan}
      onMouseLeave={endPan}
      onWheel={handleWheel}
    >
      {renderToolbar}
      <div className={styles.diagram} ref={diagramRef} style={{ minHeight: estimatedHeight }}>
        {!isReady && <div className={styles.skeleton} aria-hidden />}
        <div className={clsx(styles.content, isReady && styles.contentReady)} ref={contentRef}>
          <OriginalMermaid {...rest} value={value} />
        </div>
      </div>
    </div>
  )
}
