Page({
  data: {
    loading: false,
    checked: false,
  },

  onToggleSwitch() {
    this.setData({ loading: true })
    setTimeout(() => this.setData({
      loading: false,
      checked: !this.data.checked,
    }), 800)
  },
})
