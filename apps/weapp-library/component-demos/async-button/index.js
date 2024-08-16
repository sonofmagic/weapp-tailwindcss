Page({
  data: {
    loading: true,
  },

  onLoading() {
    this.setData({ loading: true })
  },

  onCancelLoading() {
    this.setData({ loading: false })
  },
})
