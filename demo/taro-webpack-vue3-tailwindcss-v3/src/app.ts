import { Button as NutButton } from '@nutui/nutui-taro'
import { createApp } from 'vue'

import './app.less'

const app = createApp({
  mounted() {},
  onLaunch() {},
  onShow() {},
  onHide() {},
})

app.component('NutButton', NutButton)

export default app
