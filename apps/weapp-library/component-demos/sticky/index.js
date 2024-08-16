Page({
  data: {
    scrollTop: 0,
    eventInfo: {},
  },

  onPageScroll(e) {
    this.setData({ scrollTop: e.scrollTop })
  },

  onSticky(e) {
    this.setData({ eventInfo: e.detail })
  },
})
