Page({
  data: {
    title: '',
    author: '',
    translator: '',
    publisher: '',
    pubdate_start: '',
    pubdate_end: '',
    selectedLanguageIndex: 0,
    languages: ['汉语', '英语'],
  },

  onInput(e) {
    const params = {}
    params[e.currentTarget.dataset.label] = e.detail.value
    this.setData(params)
  },

  onDateChange(e) {
    switch (e.currentTarget.dataset.type) {
      case 'start':
        this.setData({ pubdate_start: e.detail.value })
        break
      case 'end':
        this.setData({ pubdate_end: e.detail.value })
        break
    }
  },

  onLanguageChange(e) {
    this.setData({ selectedLanguageIndex: e.detail.value })
  },

  onReset() {
    this.setData({
      title: '',
      author: '',
      translator: '',
      publisher: '',
      pubdate_start: '',
      pubdate_end: '',
      selectedLanguageIndex: 0,
    })
  },

  onSearch() {
    const { languages, selectedLanguageIndex } = this.data
    let url = '/pages/list/book?type=advanced_search'
    const params = ['title', 'author', 'translator', 'publisher', 'pubdate_start', 'pubdate_end']

    // 默认至少有一个language参数，其余参数如果只包含空格的话就忽略
    url += `&language=${languages[selectedLanguageIndex]}`
    params.forEach((e) => {
      const str = this.data[e].trim()
      if (str) {
        url += `&${e}=${encodeURIComponent(str)}`
      }
    })

    wx.navigateTo({ url })
  },
})
