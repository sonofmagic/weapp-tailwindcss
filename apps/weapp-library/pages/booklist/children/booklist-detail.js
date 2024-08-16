import { deleteBooklistById, favoriteBooklistById, getBooklistById, getBooksByBooklistId, updateBooklistById } from '../../../apis/booklist'
import { isLogin } from '../../../utils/permission'
import { BL_NO_RELATION } from '../../../utils/constant'

let BOOKLIST_ID = null // 书单id

Page({
  data: {
    // 页面加载状态
    pageStatus: 'loading', // error, done
    // 书单信息
    booklistInfo: {
      // 用户是否创建或收藏了此书单(0: 未收藏, 1: 创建, 2: 收藏)
      status: undefined,
      // 书单id
      id: undefined,
      // 书单创建者
      creator: {
        avatar: '',
        phone: '',
        nickname: '',
      },
      // 书单标题
      title: '',
      // 书单描述
      description: '',
      // 书单封面
      image: '',
      // 书单内图书
      items: [
      /*
      {
        // 图书信息
        book: {},
        // 图书个性化描述
        comment: ''
      }
      */
      ],
      // 图书总数
      total: undefined,
      // 收藏人数
      favorited_num: undefined,
      // 创建时间
      created_at: undefined,
    },
    // 是否展开书单描述
    showDescription: true,
    // load-more 组件状态：hidding, loading, nomore
    loadMoreStatus: 'hidding',
    // 是否正在多选书目
    isSelecting: false,
    // async-switch 组件的加载状态
    isSwitchLoading: false,
    // 选择的书目的 id
    selectedBooks: [],
  },

  /**
   * @listens <bookDescriptionModified>
   * 事件在书单描述修改页(./children/modify)被触发
   */
  onLoad(options) {
    // 监听事件
    getApp().event.on('bookCommentModified', this.onModifed)

    BOOKLIST_ID = options.id
    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  onReachBottom() {
    const status = this.data.loadMoreStatus
    if (status !== 'hidding') { return }

    this.setData({ loadMoreStatus: 'loading' })

    const id = this.data.booklistInfo.id
    const start = this.data.booklistInfo.items.length
    getBooksByBooklistId(id, start).then((res) => {
      // 当返回数据长度为 0 时，设置为“没有更多图书”
      const tmp = this.data.booklistInfo.items.concat(res.data.books)
      const nomore = res.data.books.length === 0
      this.setData({
        'booklistInfo.items': tmp,
        'loadMoreStatus': nomore ? 'nomore' : 'hidding',
      })
    }).catch(() => this.setData({ loadMoreStatus: 'hidding' }))
  },

  onToggleDescription() {
    this.setData({ showDescription: !this.data.showDescription })
  },

  /**
   * 用户是书单创建者，打开/关闭书目多选，关闭多选时清空已选择书目
   */
  onToggleEditStatus() {
    const isSelecting = this.data.isSelecting
    this.setData({ isSelecting: !isSelecting })
    if (isSelecting) {
      this.setData({ selectedBooks: [] })
    }
  },

  /**
   * 用户不是书单创建者，收藏/取消收藏书单
   */
  onToggleFavoriteStatus() {
    // 如果没有登录，显示登录对话框
    if (!isLogin(true)) { return }

    const { id, status } = this.data.booklistInfo
    this.setData({ isSwitchLoading: true })
    if (status === BL_NO_RELATION) {
      favoriteBooklistById(id).then((res) => {
        this.setData({
          // 这个书单可能是该用户之前创建的书单，因此不直接设为BL_IS_FAVORITE
          // 而是根据服务器返回值设置
          'booklistInfo.status': res.data.status,
          'isSwitchLoading': false,
        })
      }).catch(() => this.setData({ isSwitchLoading: false }))
    }
    else {
      deleteBooklistById(id).then((res) => {
        this.setData({
          'isSwitchLoading': false,
          'booklistInfo.status': BL_NO_RELATION,
        })
      }).catch(() => this.setData({ isSwitchLoading: false }))
    }
  },

  /**
   * 图书状态变化
   */
  onChange(e) {
    const checked = e.detail.checked
    const index = e.currentTarget.dataset.index
    const id = this.data.booklistInfo.items[index].book.id
    let selectedBooks = this.data.selectedBooks

    // 若图书被选中，则将其加入已选书目中，否则从已选书目中删除
    if (checked && !selectedBooks.includes(id)) {
      selectedBooks.push(id)
    }
    else {
      selectedBooks = selectedBooks.filter(e => e !== id)
    }
    this.setData({ selectedBooks })
  },

  /**
   * 删除书目
   */
  onDelete() {
    const id = this.data.booklistInfo.id
    const selectedBooks = this.data.selectedBooks
    let books = this.data.booklistInfo.items

    if (!selectedBooks.length) { return }

    wx.showModal({
      title: '删除书目',
      content: '确定从书单内删除所选书目？这项操作将无法撤销',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '加载中', mask: true })
          updateBooklistById(id, {
            delete_items: selectedBooks,
          }).then(() => {
            wx.showToast({ title: '操作成功', duration: 2000 })

            /**
             * 更新数据
             *
             * TODO --- HOW TO FIX THE BUG?
             * 操作：
             *    选择第1、第3本书，删除书目
             * 期望结果：
             *    第1、第3本书被从页面上删除，页面上剩下的图书都是未选择状态
             * 实际结果：
             *    第1、第3本书被从页面上删除，但是页面上剩下的图书的第1、第3
             *  本仍然是选择状态
             * 原因推测：
             *    当数组的数据变动时，框架并没有把那些被删除的数据对应的组件也
             *   删除，而是从前往后保留所需数量的组件，然后把后面多出来的组件删除。
             *   这造成的问题是，前面未被删除的组件的内部状态会被保留。
             *    在这个例子里，一开始选择了第1、第3本书，所以第1、第3个booklist-item
             *   组件内部的checked属性被设为true。删除了items数组中的第1、第3
             *   项后，第1、第3个booklist-item组件并未删除，而仅仅是其中的book
             *   属性被替换为新的值。
             * 临时解决方法：
             *    在删除完书目后，设置isSelecting为false，强制让每个
             *   booklist-item组件重置checked属性为false
             */
            books = books.filter(e => !selectedBooks.includes(e.book.id))
            this.setData({
              'booklistInfo.items': books,
              'selectedBooks': [],
              'isSelecting': false, // 必需
            })
          }).catch(() => wx.hideLoading())
        }
      },
    })
  },

  /**
   * 编辑图书个性化描述
   */
  onModify(e) {
    const index = e.currentTarget.dataset.index
    const booklistId = this.data.booklistInfo.id
    const bookId = this.data.booklistInfo.items[index].book.id
    const comment = this.data.booklistInfo.items[index].comment
    const url = `./children/modify?index=${index}&booklist_id=${booklistId}&book_id=${bookId}&comment=${encodeURIComponent(comment)}`
    wx.navigateTo({ url })
  },

  /**
   * 编辑完成后更新数据
   */
  onModifed(e) {
    const key = `booklistInfo.items[${e.index}].comment`
    const params = {}
    params[key] = e.comment
    this.setData(params)
  },

  onShareAppMessage() {
    return {
      title: '向你分享书单',
      desc: this.data.booklistInfo.title,
      path: `/pages/booklist/children/booklist-detail?id=${this.data.booklistInfo.id}`,
    }
  },

  /**
   * 加载页面
   */
  _loadPage() {
    this.setData({ pageStatus: 'loading' })
    getBooklistById(BOOKLIST_ID).then((res) => {
      this.setData({
        booklistInfo: res.data,
        pageStatus: 'done',
      })
    }).catch(() => this.setData({ pageStatus: 'error' }))
  },
})
