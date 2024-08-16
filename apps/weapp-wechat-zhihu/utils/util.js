function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
}

const index = require('../data/data_index.js')
const index_next = require('../data/data_index_next.js')
const discovery = require('../data/data_discovery.js')
const discovery_next = require('../data/data_discovery_next.js')

function getData(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data: {},
      header: {
        // 'Content-Type': 'application/json'
      },
      success(res) {
        console.log('success')
        resolve(res)
      },
      fail(res) {
        reject(res)
        console.log('failed')
      },
    })
  })
}

function getData2() {
  return index.index
}

function getNext() {
  return index_next.next
}

function getDiscovery() {
  return discovery.discovery
}

function discoveryNext() {
  return discovery_next.next
}

module.exports.getData = getData
module.exports.getData2 = getData2
module.exports.getNext = getNext
module.exports.getDiscovery = getDiscovery
module.exports.discoveryNext = discoveryNext
