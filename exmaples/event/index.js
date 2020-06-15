const Ga = require('../../dist/ga.cjs')
const router = require('./router')

const app = new Ga({
  router
})

app.$mount()