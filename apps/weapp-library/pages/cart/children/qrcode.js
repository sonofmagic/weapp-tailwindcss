import QR from '../../../utils/qrcode'
import { getToken } from '../../../utils/permission'

Page({
  onReady() {
    const size = this.setCanvasSize() // 动态设置画布大小
    wx.getStorage({
      key: 'selectedBooks',
      success: (res) => {
        const params = {
          token: getToken(),
          book_id: [],
        }
        res.data.forEach(i => params.book_id.push(i.id))
        QR.qrApi.draw(JSON.stringify(params), 'qrcode', size.w, size.h)
      },
    })
  },

  // 适配不同屏幕大小的canvas
  setCanvasSize() {
    const size = {}
    try {
      const res = wx.getSystemInfoSync()
      const scale = 750 / 686 // 不同屏幕下canvas的适配比例；设计稿是750宽
      const width = res.windowWidth / scale
      const height = width // canvas画布为正方形
      size.w = width
      size.h = height
    }
    catch (e) {
      console.log(`获取设备信息失败${e}`)
    }
    return size
  },
})
