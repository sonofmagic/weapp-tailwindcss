import { createApp } from 'vue'

if (process.env.TARO_ENV !== 'rn') {
  require('./app.css')
}

const app = createApp({
  mounted() {},
  onLaunch() {},
  onShow() {},
  onHide() {},
})

export default app
