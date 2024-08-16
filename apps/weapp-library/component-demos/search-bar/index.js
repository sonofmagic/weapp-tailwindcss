Page({
  data: {
    eventInfo: '点击输入框进行操作',
  },

  onEvent(e) {
    console.log(e)

    switch (e.type) {
      case 'focus':
        this.setData({ eventInfo: '触发 focus 事件' })
        break
      case 'input':
        this.setData({ eventInfo: `触发 input 事件，输入框内容：${e.detail.value}` })
        break
      case 'clear':
        this.setData({ eventInfo: '触发 clear 事件' })
        break
      case 'hide':
        this.setData({ eventInfo: '触发 hide 事件' })
        break
      case 'search':
        this.setData({ eventInfo: `触发 search 事件，输入框内容：${e.detail.value}` })
        break
    }
  },
})
