import { useEffect, useRef, useState } from 'react'

export function useHighlight<T>(value: T, duration = 900) {
  const [highlighted, setHighlighted] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)
  const previousValue = useRef<T>()

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      previousValue.current = value
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }

    if (previousValue.current === value) {
      return
    }

    previousValue.current = value
    setHighlighted(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setHighlighted(false)
      timeoutRef.current = null
    }, duration)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, duration])

  return highlighted
}
