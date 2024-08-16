/**
 * 加载更多
 */
Component({
  properties: {
    status: {
      type: String,
      value: 'loading', // nomore, hidding
    },
    loadingText: {
      type: String,
      value: '正在加载',
    },
    nomoreText: {
      type: String,
      value: '没有更多数据了',
    },
  },
})
