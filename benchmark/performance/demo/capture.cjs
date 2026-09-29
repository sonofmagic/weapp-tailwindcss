const fs = require('node:fs')
const { Transform } = require('node:stream')

function encode(value) {
  if (value instanceof RegExp) return { $regexp: value.source, flags: value.flags }
  if (typeof value === 'function') throw new Error('性能预编译尚不能持久化带闭包的插件配置，拒绝不等价对照')
  if (Array.isArray(value)) return value.map(encode)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)]))
  return value
}

function record(key, value) {
  const file = process.env.WEAPP_DEMO_COST_CAPTURE
  if (!file) throw new Error('捕获器只允许在准备阶段运行')
  fs.appendFileSync(file, `${JSON.stringify({ key, value: encode(value) })}\n`)
}

function capture(module, name, original) {
  if (typeof original !== 'function') return original
  return function (...args) {
    if (['WeappTailwindcss', 'createPlugins', 'StyleInjector'].includes(name)) record('options', { module, options: args[0] ?? {} })
    const result = new.target ? Reflect.construct(original, args) : original(...args)
    if (module.endsWith('/framework') || module.endsWith('/presets')) record(`helper:${name}`, result)
    return result
  }
}

function decode(value, from, to) {
  if (value?.$regexp) return new RegExp(value.$regexp, value.flags)
  if (typeof value === 'string') return value.replaceAll(from, to)
  if (Array.isArray(value)) return value.map(item => decode(item, from, to))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decode(item, from, to)]))
  return value
}

function disabled(name, records, from, root, specifier = '') {
  if (name === 'WeappTailwindcss' || name === 'StyleInjector') return function () { return new.target || /\/(?:webpack|rspack)(?:\/|$)/.test(specifier) ? { apply() {} } : [] }
  if (name === 'patchRspackConfig') return value => value
  if (name === 'createPlugins') return () => Object.fromEntries(['adaptWxss', 'generateWxss', 'transformJs', 'transformWxml'].map(key => [key, () => new Transform({ objectMode: true, transform(file, encoding, done) { done(null, file) } })]))
  const helper = records.filter(row => row.key === `helper:${name}`)
  if (helper.length) {
    if (new Set(helper.map(row => JSON.stringify(row.value))).size !== 1) throw new Error(`平台 helper 有多种结果，必须拆分目标：${name}`)
    return () => decode(helper[0].value, from, root)
  }
  throw new Error(`不支持的禁用导出 ${name}`)
}

exports.capture = capture
exports.disabled = disabled
exports.encode = encode
exports.decode = decode
exports.captureOptions = options => { record('options', { module: 'weapp-vite', options }); return options }
