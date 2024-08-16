import { get } from './request.js'

module.exports = {
  getSonNumbersByNumber(number, start = 0) {
    return get(`/classifications/${number}/sons`, { start })
  },
}
