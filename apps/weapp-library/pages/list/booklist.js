import { deleteBooklistById, favoriteBooklistById, getBooklistsByKeyword, getRecommendedBooklistsByUserId } from '../../apis/booklist'
import Promisify from '../../utils/promisify'
import { getUID } from '../../utils/permission'
import { BL_IS_CREATOR, BL_IS_FAVORITE, BL_NO_RELATION } from '../../utils/constant'

Page({
  data: {
    booklists: [
    /*
    {
      id: '',
      status: 0, // 0：没有任何关系 1：创建者 2：已收藏
      title: '',
      creator: {
        nickname: '', // 创建者
        avatar: '' // 头像url
      },
      favorited_num: 0, // 收藏人数
      total: 0 // 书单内图书总数
    }
    */
    ],
    type: '', // 页面类型：recommend，search
    keyword: '', // 搜索关键字
    loadMoreStatus: 'hidding', // loading, nomore
    isNoData: false, // 是否没有数据
  },

  onLoad(options) {
    this.setData({
      keyword: options.keyword ? decodeURIComponent(options.keyword) : '',
      type: options.type,
    })
    if (options.type === 'search') {
      wx.setNavigationBarTitle({ title: '搜索结果' })
    }
    else if (options.type === 'recommend') {
      wx.setNavigationBarTitle({ title: '推荐书单' })
    }

    wx.showLoading({ title: '加载中', mask: true })
    this._fetchData().then((booklists) => {
      // 第一次加载数据时判断是否“暂无数据”
      this.setData({
        booklists: this.data.booklists.concat(booklists),
        isNoData: booklists.length === 0,
      })
    }).finally(() => wx.hideLoading())
  },

  onReachBottom() {
    const { type, loadMoreStatus, isNoData, booklists } = this.data

    // 推荐书单一次性加载完毕，不再加载
    if (loadMoreStatus !== 'hidding' || isNoData || type === 'recommend') { return }

    this.setData({ loadMoreStatus: 'loading' })
    this._fetchData(booklists.length).then((booklists) => {
      this.setData({
        booklists: this.data.booklists.concat(booklists),
        loadMoreStatus: booklists.length === 0 ? 'nomore' : 'hidding',
      })
    }).catch(() => this.setData({ loadMoreStatus: 'hidding' }))
  },

  onShowActionSheet(e) {
    const booklists = this.data.booklists
    const index = e.currentTarget.dataset.index
    const { id, status } = booklists[index]
    let actions

    if (status == BL_IS_CREATOR) {
      actions = ['编辑书单']
    }
    else if (status == BL_IS_FAVORITE) {
      actions = ['取消收藏']
    }
    else {
      actions = ['收藏书单']
    }

    Promisify(wx.showActionSheet)({
      itemList: actions,
      itemColor: '#000',
    }).then((res) => {
      if (status == BL_IS_CREATOR) {
        // 编辑书单
        wx.navigateTo({ url: `/pages/booklist/children/modify?type=modify&id=${id}` })
      }
      else if (status == BL_NO_RELATION) {
        // 收藏书单
        wx.showLoading({ title: '加载中', mask: true })
        favoriteBooklistById(id).then((res) => {
          // 这个书单可能是该用户之前创建的书单，因此不直接设为BL_IS_FAVORITE
          // 而是根据服务器返回值设置
          booklists[index].status = res.data.status
          this.setData({ booklists })
          wx.showToast({ title: '操作成功' })
        }).catch(() => wx.hideLoading())
      }
      else if (status == BL_IS_FAVORITE) {
        // 取消收藏
        Promisify(wx.showModal)({
          title: '取消收藏',
          content: '确定取消收藏此书单？这项操作将无法撤销',
        }).then((res) => {
          if (res.confirm) {
            wx.showLoading({ title: '加载中', mask: true })
            deleteBooklistById(id).then(() => {
              wx.showToast({ title: '操作成功' })
              booklists[index].status = BL_NO_RELATION
              this.setData({ booklists })
            }).catch(() => wx.hideLoading())
          }
        })
      }
    }).catch((e) => {
      // cancel
    })
  },

  /**
   * 获取书单列表
   * @param start {Integer} 搜索偏移量
   */
  _fetchData(start = 0) {
    const { type, keyword } = this.data
    if (type === 'recommend') {
      return getRecommendedBooklistsByUserId(getUID()).then(res => res.data)
    }
    else {
      return getBooklistsByKeyword(keyword, start).then(res => res.data.booklists)
    }
  },
})
