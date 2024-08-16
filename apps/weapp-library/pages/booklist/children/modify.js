import { createBooklist, getBooklistById, updateBooklistById } from '../../../apis/booklist'
import { showTip } from '../../../utils/tip'
import { getUID } from '../../../utils/permission'

let NB_TIMER

// 保存页面参数
let options = {
  type: undefined, // 操作类型：create，modify
  id: undefined, // 书单id
}
let toptip // 保存toptip组件的引用

Page({
  data: {
    title: '',
    description: '',
  },

  onLoad(opts) {
    options = opts
    toptip = this.selectComponent('#toptip')

    if (options.type === 'modify') {
      wx.showLoading({ title: '加载中', mask: true })
      getBooklistById(options.id).then((res) => {
        wx.hideLoading()
        this.setData({
          title: res.data.title,
          description: res.data.description,
        })
      }).catch(() => {
        wx.hideLoading()
        wx.navigateBack() // 出错时（显示错误Modal后）返回上一页
      })
    }

    if (options.type === 'create') {
      showTip('CREATE_BOOKLIST')
    }
  },

  onUnload() {
    clearTimeout(NB_TIMER)
  },

  onInput(e) {
    const label = e.currentTarget.dataset.label
    const params = {}
    params[label] = e.detail.value
    this.setData(params)
  },

  onSubmit() {
    if (!this.data.title.length) { return toptip.show('请输入书单标题') }

    wx.showLoading({ title: '加载中', mask: true })

    const { title, description } = this.data
    const params = { title, description }
    let fn
    if (options.type === 'create') {
      fn = createBooklist({
        ...params,
        wechat_user_id: getUID(),
      })
    }
    else {
      fn = updateBooklistById(options.id, params)
    }
    fn.then(() => {
      wx.hideLoading()
      wx.showToast({ title: '操作成功', mask: true })
      NB_TIMER = setTimeout(() => wx.navigateBack(), 1000)
    }).catch(() => wx.hideLoading())
  },
})
