const process = require('node:process')
const express = require('express')
const minimist = require('minimist')
const logger = require('morgan')

const args = minimist(process.argv.slice(2), {
  number: ['port'],
  default: { port: 3000 },
})

const port = args.port
const server = express()
const router = require('./router.js')

// 添加延迟，模拟真实场景
server.use((_request, _res, next) => {
  setTimeout(next, 500)
})

server.use(logger('dev', {
  skip: req =>
    process.env.NODE_ENV === 'test' || req.path === '/favicon.ico',
}))

server.use(router)

server.listen(port, () => {
  console.log(`open mock server at localhost:${port}`)
})
