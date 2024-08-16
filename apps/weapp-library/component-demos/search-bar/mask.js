Page({
  data: {
    tappable: false,
  },

  onLoad(options) {
    if (options.tappable) {
      this.setData({ tappable: true })
    }
  },
})
