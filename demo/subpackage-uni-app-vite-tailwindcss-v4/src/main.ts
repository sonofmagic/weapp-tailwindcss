import { createSSRApp } from 'vue'
import App from './App.vue'
import './main.css'

if (process.env.UNI_PLATFORM === 'h5') {
  void import('./sub-normal/index.css')
  void import('./sub-independent/index.css')
}

export function createApp() {
  const app = createSSRApp(App)
  return {
    app,
  }
}
