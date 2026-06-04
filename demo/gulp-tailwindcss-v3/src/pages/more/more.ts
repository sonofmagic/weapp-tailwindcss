// logs.js
import { formatTime } from '../../utils/util'

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    console.log(formatTime(new Date()))
  }
})
