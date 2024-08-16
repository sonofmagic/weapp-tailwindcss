import Promise from './es6-promise'

/**
 * 函数节流 函数连续调用时，func 执行频率限定为 次 / wait
 * underscore.js 实现
 * @param {Function} func 传入函数
 * @param {number} wait 表示时间窗口的间隔
 * @param {object} options 如果想忽略开始边界上的调用，传入{leading: false}
 * @param {object} options.leading 是否在开始边界上调用，默认true
 * @param {object} options.trailing 是否在结尾边界上调用，默认true
 * @return {Function} 返回客户调用函数
 */
export function throttle(func, wait, options) {
  let context, args, result
  let timeout = null
  // 上次执行时间点
  let previous = 0
  if (!options) { options = {} }
  // 延迟执行函数
  const later = function () {
    // 若设定了开始边界不执行选项，上次执行时间始终为0
    previous = options.leading === false ? 0 : new Date()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) { context = args = null }
  }
  return function () {
    const now = new Date()
    // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
    if (!previous && options.leading === false) { previous = now }
    // 延迟执行时间间隔
    const remaining = wait - (now - previous)
    context = this
    args = arguments
    // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
    // remaining大于时间窗口wait，表示客户端系统时间被调整过
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout)
      timeout = null
      previous = now
      result = func.apply(context, args)
      if (!timeout) { context = args = null }
    // 如果延迟执行不存在，且没有设定结尾边界不执行选项
    }
    else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

/**
 * 函数防抖 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 * https://www.npmjs.com/package/debounce-promise
 * @param {Function} func 传入函数
 * @param {number} wait 表示时间窗口的间隔
 * @param {object} options 其他参数
 * @param {boolean} options.leading 调用触发于开始边界而不是结束边界
 * @param {boolean} options.accumulate 保留现在接收到的所有参数并以数组的方式传递给传入函数
 * @return {Function} 返回客户调用函数
 */
export function debounce(fn, wait = 0, options = {}) {
  let lastCallAt
  let deferred
  let timer
  let pendingArgs = []
  return function debounced(...args) {
    const currentWait = getWait(wait)
    const currentTime = new Date().getTime()

    const isCold = !lastCallAt || (currentTime - lastCallAt) > currentWait

    lastCallAt = currentTime

    if (isCold && options.leading) {
      return options.accumulate
        ? Promise.resolve(fn.call(this, [args])).then(result => result[0])
        : Promise.resolve(fn.call(this, ...args))
    }

    if (deferred) {
      clearTimeout(timer)
    }
    else {
      deferred = defer()
    }

    pendingArgs.push(args)
    timer = setTimeout(flush.bind(this), currentWait)

    if (options.accumulate) {
      const argsIndex = pendingArgs.length - 1
      return deferred.promise.then(results => results[argsIndex])
    }

    return deferred.promise
  }

  function flush() {
    const thisDeferred = deferred
    clearTimeout(timer)

    Promise.resolve(
      options.accumulate
        ? fn.call(this, pendingArgs)
        : fn.apply(this, pendingArgs[pendingArgs.length - 1]),
    )
      .then(thisDeferred.resolve, thisDeferred.reject)

    pendingArgs = []
    deferred = null
  }
}

function getWait(wait) {
  return (typeof wait === 'function') ? wait() : wait
}

function defer() {
  const deferred = {}
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

/**
 * 将日期对象转为日期字符串: '2018-04-22'
 * @param glue {String} 连接符号
 */
export function formatDate(date, glue = '-') {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map((n) => {
    n = n.toString()
    return n[1] ? n : `0${n}`
  }).join(glue)
}

/**
 * 日期加减
 * @param interval {String} 要添加的时间间隔的单位
 *        { y: year, q: quarter, M: month, w: week,
            d: day, h: hour, m: minute, s: second}
 * @param number {Number} 要添加的时间间隔
 * @param date 时间对象
 * @return {Date} 新的时间对象
 * 使用：
 * var now = new Date();
 * var newDate = DateAdd( "d", 5, now);
 */
export function dateAdd(interval, number, date) {
  switch (interval) {
    case 'y': {
      date.setFullYear(date.getFullYear() + number)
      return date
    }
    case 'q': {
      date.setMonth(date.getMonth() + number * 3)
      return date
    }
    case 'M': {
      date.setMonth(date.getMonth() + number)
      return date
    }
    case 'w': {
      date.setDate(date.getDate() + number * 7)
      return date
    }
    case 'd': {
      date.setDate(date.getDate() + number)
      return date
    }
    case 'h': {
      date.setHours(date.getHours() + number)
      return date
    }
    case 'm': {
      date.setMinutes(date.getMinutes() + number)
      return date
    }
    case 's': {
      date.setSeconds(date.getSeconds() + number)
      return date
    }
  }
}
