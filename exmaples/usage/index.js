const Ga = require('../../dist/ga.cjs')
// 引入路由
const router = require('./router')

// 实例化
const app = new Ga({
  router
})

// 手动挂载
app.$mount()