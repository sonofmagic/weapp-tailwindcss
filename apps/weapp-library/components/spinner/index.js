/**
 * 加载组件
 * 修改了下面的库的css，目前只整合了三个样式
 * https://github.com/ConnorAtherton/loaders.css/blob/master/loaders.css
 */
Component({
  properties: {
    /**
     * 动画类型
     * 可选：line-scale，line-scale-pulse-out，ball-pulse-sync
     */
    type: {
      type: String,
      value: 'line-scale-pulse-out',
    },
    /**
     * 背景颜色
     */
    bgColor: {
      type: String,
      value: '#999',
    },
  },
})
