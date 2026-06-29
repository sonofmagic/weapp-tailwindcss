import { createSSRApp } from 'vue'
import App from './App.vue'
import './main.css'
// #ifdef H5
import './sub-normal/index.css'
import './sub-independent/index.css'
// #endif

export function createApp() {
  const app = createSSRApp(App)
  return {
    app,
  }
}
