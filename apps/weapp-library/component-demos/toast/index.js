let toast

Page({
  onReady() {
    toast = this.selectComponent('#toast')
  },

  onShowDefault() {
    toast.show('我是一个浮动提示')
  },

  onShowPostion(e) {
    const position = e.currentTarget.dataset.pos
    toast.show('我是一个浮动提示', { position })
  },

  onShowDuration() {
    toast.show('我在五秒钟后会消失', { duration: 5000 })
  },
})
