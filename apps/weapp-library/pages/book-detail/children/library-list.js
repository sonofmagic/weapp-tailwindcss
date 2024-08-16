import { getCollectionsByBookId } from '../../../apis/collection'
import { debounce } from '../../../utils/utils'

/**
 * searching属性初始值
 * 每次输入框focu、clear、input时都要重置searching为初始状态
 */
const SEARCHING_INITIAL_CONFIG = {
  libraries: [], // 图书馆列表
  loadMoreStatus: 'hidding', // 加载更多组件：loading, nomore，hidding
  isNoData: false, // 是否暂无数据
}

Page({
  data: {
    id: null, // 图书id
    isFocus: false, // 是否正在输入
    keyword: '', // 输入框内容
    default: {
      libraries: [], // 默认状态下的的图书馆列表，未输入关键字时展示
      loadMoreStatus: 'hidding', // 加载更多组件：loading, nomore，hidding
      isNoData: false, // 是否暂无数据
    },
    searching: {
      libraries: [], // 搜索结果，输入关键字时展示
      loadMoreStatus: 'hidding', // 加载更多组件：loading, nomore，hidding
      isNoData: false, // 是否暂无数据
    },
  },

  onLoad(options) {
    this.setData({ id: options.id })
    wx.showLoading({ title: '加载中', mask: true })
    this._fetchData('default').then((res) => {
      this.setData({
        'default.libraries': res,
        'default.isNoData': res.length === 0,
      })
    }).catch(() => {
      this.setData({ 'default.isNoData': true })
    }).finally(() => wx.hideLoading())
  },

  onFocus() {
    this.setData({
      searching: { ...SEARCHING_INITIAL_CONFIG },
      isFocus: true,
    })
  },

  onUnfocus() {
    this.setData({
      isFocus: false,
      keyword: '',
    })
    wx.hideNavigationBarLoading()
    // TODO：通过关闭requestTask来取消请求，而不只是隐藏loading
  },

  onClear() {
    this.setData({
      searching: { ...SEARCHING_INITIAL_CONFIG },
      keyword: '',
    })
    wx.hideNavigationBarLoading()
  },

  /**
   * 在输入文字时动态搜索数据
   */
  onInput(e) {
    const value = e.detail.value
    this.setData({
      searching: { ...SEARCHING_INITIAL_CONFIG },
      keyword: value,
    })

    // 如果当前关键字为空，停止搜索，隐藏标题loading
    if (!value.trim()) {
      return wx.hideNavigationBarLoading()
    }
    else {
      // 否则动态搜索数据
      wx.showNavigationBarLoading()
      this._debouncedFetchData('searching').then((res) => {
        this.setData({
          'searching.libraries': res,
          'searching.isNoData': res.length === 0,
        })
      }).catch(() => {
        this.setData({ 'searching.isNoData': true })
      }).finally(() => {
        wx.hideNavigationBarLoading()
      })
    }
  },

  onReachBottom() {
    const { isFocus } = this.data
    const TYPE = isFocus ? 'searching' : 'default'

    // 加载中或没有数据时返回
    const { loadMoreStatus, isNoData } = this.data[TYPE]
    if (loadMoreStatus !== 'hidding' || isNoData) { return }

    // 加载数据并设置loading组件状态
    const params = {} // eg: {'default.loadMoreStatus': xxx}
    params[`${TYPE}.loadMoreStatus`] = 'loading'
    this.setData(params)
    this._fetchData(TYPE).then((res) => {
      const { libraries } = this.data[TYPE]
      params[`${TYPE}.libraries`] = libraries.concat(res)
      params[`${TYPE}.loadMoreStatus`] = res.length ? 'hidding' : 'nomore'
      this.setData(params)
    }).catch(() => {
      params[`${TYPE}.loadMoreStatus`] = 'hidding'
      this.setData(params)
    })
  },

  /**
   * 获取数据，防止文字输入过快时频繁请求
   */
  _debouncedFetchData: debounce(fetchData, 500),

  /**
   * 获取数据，返回馆藏列表
   */
  _fetchData: fetchData,
})

/**
 * 获取数据，返回馆藏列表
 * @param type {string} enum:[default, searching]
 * @return array
 */
function fetchData(type) {
  const { id, keyword } = this.data

  // 关键字为空时不搜索
  if (type === 'searching' && !keyword.trim()) {
    return Promise.reject(new Error('关键字不能为空'))
  }

  /**
   * 在网络慢的情况下，有可能关键字已经被改变但是上次请求还没有完成，
   * 因此在查询状态下，需要判断本次响应内容是否对应当前查询的关键字，
   * 如果对应再更新数据
   */
  return getCollectionsByBookId(id, {
    start: this.data[type].libraries.length,
    library_name: type === 'searching' ? keyword : null,
  }).then((res) => {
    if (type === 'searching') {
      const { isFocus, keyword: currentKeyword } = this.data
      if (!isFocus) {
        return Promise.reject(new Error('unfocus 丢弃响应结果'))
      }
      if (currentKeyword !== keyword) {
        return Promise.reject(new Error('timeout 结果返回超时'))
      }
    }
    return res.data.collections
  })
}
