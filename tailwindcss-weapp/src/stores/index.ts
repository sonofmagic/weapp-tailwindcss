import { defineStore } from 'pinia'
import * as corePlugins from 'tailwindcss-core-plugins-extractor'

const themeCacheKey = 'theme-mode'

export const useSystemStore = defineStore('system', {
  state() {
    return {
      corePlugins,
      systemInfo: uni.getSystemInfoSync(),
      theme: (uni.getStorageSync(themeCacheKey) || 'dark') as 'dark' | 'light',
    }
  },
  getters: {
    pluginKeys(state) {
      return Object.keys(state.corePlugins)
    },
  },
  actions: {
    getPluginsById(id: string) {
      return (this.corePlugins as Record<string, object>)[id]
    },
    setTheme(theme: 'dark' | 'light') {
      this.theme = theme
      uni.setStorageSync(themeCacheKey, this.theme)
    },
  },
})
