import { Button as NutButton } from '@nutui/nutui-taro'
import { createApp } from 'vue'

import './app.css'

const app = createApp({
  mounted() {},
  onLaunch() {},
  onShow() {},
  onHide() {},
})

app.use(NutButton)

export default app
