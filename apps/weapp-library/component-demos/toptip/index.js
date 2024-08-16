let toptip

Page({
  onReady() {
    toptip = this.selectComponent('#toptip')
  },

  onShowDefault() {
    toptip.show('我是一个顶部提示')
  },

  onShowType(e) {
    const type = e.currentTarget.dataset.type
    toptip.show('我是一个顶部提示', { type })
  },

  onShowDuration() {
    toptip.show('我在五秒钟后会消失', { duration: 5000 })
  },
})
