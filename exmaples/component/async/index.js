const Ga = require('../../../dist/ga.cjs')
const router = require('./router')

// Ga.config.test = true

const app = new Ga({
  router
})

app.$mount()