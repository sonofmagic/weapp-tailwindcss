import discovery from '@/data/data_discovery.js'
import discovery_next from '@/data/data_discovery_next.js'
import index from '@/data/data_index.js'
import index_next from '@/data/data_index_next.js'

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

export {
  discoveryNext,
  formatTime,
  getData,
  getData2,
  getDiscovery,
  getNext,
}
