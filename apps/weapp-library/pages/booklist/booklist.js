import { deleteBooklistById, getBooklistsByUserId } from '../../apis/booklist'
import Promisify from '../../utils/promisify'
import { getUID } from '../../utils/permission'

Page({
  data: {
    booklists: {
      create: [], // 我创建的书单
      favorite: [], // 我收藏的书单
    },
  },

  onLoad(options) {
    wx.showNavigationBarLoading()
    this._fetchData().finally(() => wx.hideNavigationBarLoading())
  },

  onShow() {
    this._fetchData()
  },

  onPullDownRefresh() {
    this._fetchData().finally(() => wx.stopPullDownRefresh())
  },

  onSearch(e) {
    wx.navigateTo({
      url: `/pages/list/booklist?type=search&keyword=${encodeURIComponent(e.detail.value)}`,
    })
  },

  onCreate() {
    wx.navigateTo({ url: './children/modify?type=create' })
  },

  onShowActionSheet(e) {
    const actions = {
      create: ['编辑书单', '删除书单'],
      favorite: ['取消收藏'],
    }
    const { type, index } = e.currentTarget.dataset
    const { booklists } = this.data
    const id = booklists[type][index].id

    Promisify(wx.showActionSheet)({
      itemList: actions[type],
      itemColor: '#000',
    }).then((res) => {
      // 如果点击了“编辑书单”，则跳转至书单信息编辑页
      if (res.tapIndex === 0 && type === 'create') {
        wx.navigateTo({
          url: `./children/modify?type=modify&id=${id}`,
        })
      }
      else {
        let title
        let content
        if (type === 'create') {
          title = '删除书单'
          content = '确定删除此书单及其包含书目？这项操作将无法撤销'
        }
        else {
          title = '取消收藏'
          content = '确定取消收藏此书单？这项操作将无法撤销'
        }

        wx.showModal({
          title,
          content,
          success: (res) => {
            if (res.confirm) {
              // 删除书单/取消收藏使用同一个接口
              wx.showLoading({ title: '加载中', mask: true })
              deleteBooklistById(id).then(() => {
                booklists[type].splice(index, 1) // 从data中删除该书单
                this.setData({ booklists })
                wx.showToast({ title: '操作成功' })
              }).catch(() => wx.hideLoading())
            }
          },
        })
      }
    }).catch((e) => {
      // cancel
    })
  },

  _fetchData() {
    return getBooklistsByUserId(getUID()).then((res) => {
      this.setData({ booklists: res.data })
    })
  },
})
