import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './pages/index.vue'
import EchartView from './pages/echart.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/echart', component: EchartView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
