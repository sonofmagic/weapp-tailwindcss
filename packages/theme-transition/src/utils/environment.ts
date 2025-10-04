import type { AnimationTarget, DocumentWithViewTransition } from './types'

export function resolveGlobalDocument(documentLike?: DocumentWithViewTransition) {
  if (documentLike) {
    return documentLike
  }
  return typeof document !== 'undefined' ? document as DocumentWithViewTransition : undefined
}

export function resolveGlobalWindow(windowLike?: Window & typeof globalThis) {
  if (windowLike) {
    return windowLike
  }
  return typeof window !== 'undefined' ? window : undefined
}

export function resolveAnimationTarget(
  target: AnimationTarget | undefined,
  documentLike: DocumentWithViewTransition | undefined,
) {
  if (typeof target === 'function') {
    return target() ?? null
  }
  if (target) {
    return target
  }
  return documentLike?.documentElement ?? null
}

export function bindViewTransition(documentLike: DocumentWithViewTransition | undefined) {
  return documentLike?.startViewTransition?.bind(documentLike)
}

export function detectReducedMotion(windowLike: (Window & typeof globalThis) | undefined) {
  return Boolean(windowLike?.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

export function supportsElementAnimate(target: Element | null) {
  return typeof target?.animate === 'function'
}
