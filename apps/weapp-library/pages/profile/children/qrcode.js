import QR from '../../../utils/qrcode.js'
import { getToken } from '../../../utils/permission'

Page({
  onReady() {
    const size = this.setCanvasSize() // 动态设置画布大小
    const params = JSON.stringify({ token: getToken(), time: Date.now() })
    QR.qrApi.draw(params, 'qrcode', size.w, size.h)
  },

  // 适配不同屏幕大小的canvas
  setCanvasSize() {
    const size = {}
    try {
      const res = wx.getSystemInfoSync()
      const scale = 750 / 686// 不同屏幕下canvas的适配比例；设计稿是750宽
      const width = res.windowWidth / scale
      const height = width// canvas画布为正方形
      size.w = width
      size.h = height
    }
    catch (e) {
      console.log(`获取设备信息失败${e}`)
    }
    return size
  },
})
