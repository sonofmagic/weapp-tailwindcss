const Bench = require('./bench')

const bench = new Bench('test')

bench.start()

setTimeout(() => {
  bench.end()
  bench.dump()
}, 1000)
