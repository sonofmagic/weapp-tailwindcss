import type { UserConfig, UserConfigExport, UserConfigFnObject } from 'vite'

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
