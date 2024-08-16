import { getBookByISBN } from '../../apis/book'
import Promisify from '../../utils/promisify'
import { isISBN } from '../../utils/validator'

Page({
  data: {
    selectedBooks: [],
  },

  onLoad() {
    wx.getStorage({
      key: 'selectedBooks',
      success: (res) => {
        this.setData({ selectedBooks: res.data })
      },
    })
  },

  onDelete(e) {
    wx.showModal({
      title: '删除图书',
      content: '确定删除该图书？这项操作将无法撤销',
      success: (res) => {
        if (res.confirm) {
          this.data.selectedBooks.splice(e.currentTarget.dataset.index, 1)
          this.setData({ selectedBooks: this.data.selectedBooks })
          wx.setStorage({
            key: 'selectedBooks',
            data: this.data.selectedBooks,
          })
        }
      },
    })
  },

  onShowHelp() {
    wx.showModal({
      title: '借书步骤',
      content: '① 扫描图书馆图书的ISBN条形码，将其添加入借书栏，一次最多可添加两本图书\n ② 携带图书到前台，向管理员出示借书二维码\n ③管理员确认后，微信支付提交押金，借书成功',
      showCancel: false,
    })
  },

  onScan() {
    if (this.data.selectedBooks.length >= 2) {
      return wx.showModal({ content: '一次性最多只能借阅两本图书', showCancel: false })
    }

    const scanfn = Promisify(wx.scanCode)
    scanfn({ scanType: ['barCode'] }).then((res) => {
      if (!isISBN(res.result)) {
        return wx.showModal({
          title: '扫描内容不合法',
          content: '请扫描图书ISBN条形码',
          showCancel: false,
        })
      }

      // 如果已存在此图书，将其移动到第一个
      const index = this.data.selectedBooks.findIndex(i => i.isbn == res.result)
      if (index != -1) {
        const temp = this.data.selectedBooks[index]
        this.data.selectedBooks.splice(index, 1)
        this.data.selectedBooks.unshift(temp)
        this.setData({ selectedBooks: this.data.selectedBooks })
        return
      }

      // 如果不存在此图书，获取图书信息，保存在本地
      wx.showLoading({ title: '加载中', mask: true })
      return getBookByISBN(res.result).then((res) => {
        this.data.selectedBooks.unshift(res.data) // 不需要再检测长度是否大于 2
        this.setData({ selectedBooks: this.data.selectedBooks })
        wx.setStorage({
          key: 'selectedBooks',
          data: this.data.selectedBooks,
        })
      }).finally(() => wx.hideLoading())
    })
  },
})
