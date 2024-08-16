import Promisify from '../utils/promisify'
import { BASE_URL, get, post } from './request'

module.exports = {
  sendCode(phone) {
    return post(`/codes?phone=${phone}&type=wechat`)
  },
  checkCode(phone, code) {
    return get('/codes/check', { phone, code, type: 'wechat' })
  },
  uploadIdCardImg(filepath) {
    return Promisify(wx.uploadFile)({
      url: `${BASE_URL}/upload`,
      filePath: filepath,
      name: 'picture',
    }).then((res) => {
      if (res.statusCode != 200) {
        try {
          res.data = JSON.parse(res.data)
        }
        catch (e) {

        }
        wx.showModal({
          title: '上传图片失败',
          content: (res.data && res.data.message) ? res.data.message : '发生未知错误',
          showCancel: false,
        })
        return Promise.reject(new Error('上传图片失败'))
      }
      else {
        return res.data
      }
    })
  },
  updateUserInfoById(id, params) {
    return post(`/users/${id}`, params)
  },
  getUserInfoById(id) {
    return get(`/users/${id}`)
  },
}
