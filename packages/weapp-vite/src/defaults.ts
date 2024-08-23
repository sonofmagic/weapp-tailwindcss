import type { WatchOptions } from './types'

export const defaultExcluded: string[] = ['**/node_modules/**', '**/miniprogram_npm/**']

export function getWeappWatchOptions(): WatchOptions {
  return {
    paths: ['**/*.{wxml,json,wxs}', '**/*.{png,jpg,jpeg,gif,svg,webp}', '.env', '.env.*'],
    ignored: [
      ...defaultExcluded,
    ],
  }
}
