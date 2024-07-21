import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
// @ts-ignore
import uviewPlus from 'uview-plus'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  app.use(uviewPlus)
  return {
    app,
    Pinia,
  }
}
