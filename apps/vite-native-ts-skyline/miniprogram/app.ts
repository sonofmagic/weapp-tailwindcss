import { createApp, onLaunch } from 'wevu'

createApp({
  globalData: {},
  setup() {
    onLaunch(() => {
      const logs: number[] = wx.getStorageSync('logs') || []
      logs.unshift(Date.now())
      wx.setStorageSync('logs', logs)

      wx.login({
        success: (res) => {
          console.log(res.code)
        },
      })
    })
  },
})
