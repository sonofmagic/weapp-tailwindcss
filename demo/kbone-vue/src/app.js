import './app.css'

App({
  onLaunch(options) {},
  onShow(options) {
    // 获取当前页面实例
    const pages = getCurrentPages() || []
    const currentPage = pages[pages.length - 1]

    // 获取当前页面的 window 对象和 document 对象
    if (currentPage) {
      console.log(currentPage.window)
      console.log(currentPage.document)
    }
  },
  onHide() {},
  onError(err) {},
  onPageNotFound(options) {}
})
