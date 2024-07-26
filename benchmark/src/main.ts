import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import '@google/model-viewer'

createApp(App).use(router).mount('#app')
