const initRouter = require('./router')
const { noop, handleError } = require('./utils')

function Ga(options) {
  if (!(this instanceof Ga)) new Ga(options)

  this.$config = {
    // 自动清除屏幕
    autoClear: true
  }
  

  // 公共存储对象
  this.store = {}
  this.$router = options.router(this) || {}
  const { mount = noop, mounted = noop, error = handleError } = this.$router
  // 全局错误捕获
  process.on('uncaughtException', err => error(err))
  // 初始化路由
  initRouter(this)
  // mount 钩子
  mount()
  // 挂载路由
  this.$mount()
  // mounted 钩子
  mounted()
}

module.exports = Ga