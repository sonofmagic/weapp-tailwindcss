Component({
  data: {
    count: 0,
  },
  methods: {
    inc() {
      this.setData({ count: this.data.count + 1 })
    },
    dec() {
      this.setData({ count: this.data.count - 1 })
    },
  },
})
