let sendBtns // 保存send-code组件的引用

Page({
  onReady() {
    sendBtns = [
      this.selectComponent('#send-btn-1'),
      this.selectComponent('#send-btn-2'),
      this.selectComponent('#send-btn-3'),
      this.selectComponent('#send-btn-4'),
    ]
  },

  onSend(e) {
    let btn

    switch (e.target.id) {
      case 'send-btn-1':
        btn = sendBtns[0]
        break
      case 'send-btn-2':
        btn = sendBtns[1]
        break
      case 'send-btn-3':
        btn = sendBtns[2]
        break
      case 'send-btn-4':
        wx.showModal({ content: '点击发送按钮', showCancel: false })
        btn = sendBtns[3]
        break
    }

    btn.prepare()
    setTimeout(() => btn.start(), 1000)
  },

  onEnd() {
    wx.showModal({ content: '倒计时结束', showCancel: false })
  },
})
