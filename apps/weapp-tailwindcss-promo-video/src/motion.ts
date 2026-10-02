import { Easing, interpolate } from 'remotion'

export const ease = Easing.bezier(0.18, 1, 0.3, 1)
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
export function enter(frame: number, delay = 0, duration = 30) {
  return interpolate(frame, [delay, delay + duration], [0, 1], { ...clamp, easing: ease })
}
export function rise(frame: number, delay = 0, distance = 40) {
  const value = enter(frame, delay)
  return { opacity: value, transform: `translateY(${(1 - value) * distance}px)` }
}
