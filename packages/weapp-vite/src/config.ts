// https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/types/vite.ts
// https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/public/config.ts
import type { UserConfig, UserConfigExport, UserConfigFnObject } from 'vite'
import type { WeappViteConfig } from './types'

// 扩展 vite 的 UserConfig
declare module 'vite' {
  interface UserConfig {
    weapp?: WeappViteConfig
  }
}

export function defineConfig(config: UserConfig): UserConfig
export function defineConfig(config: Promise<UserConfig>): Promise<UserConfig>
export function defineConfig(config: UserConfigFnObject): UserConfigFnObject
export function defineConfig(config: UserConfigExport): UserConfigExport
export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config
}

export type {
  UserConfig,
  UserConfigExport,
  UserConfigFnObject,
}
