const initRouter = require('./router')


function Ga(options) {
  if (!(this instanceof Ga)) new Ga(options)

  this.$router = options.router(this) || {}
  // 公共数据
  this.store = {}
  initRouter(this)
  // 挂载路由
  this.$mount()
}


module.exports = Ga