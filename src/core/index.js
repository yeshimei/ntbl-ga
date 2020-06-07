const { initMixin } = require('./init')
const { routeMixin } = require('./router')
const { lifecycleMixin } = require('./lifecycle')
const { terminalMixin } = require('./terminal')

function Ga(options) {
  if (!(this instanceof Ga)) new Ga(options)
  this._init(options)
}

initMixin(Ga)
terminalMixin(Ga)
routeMixin(Ga)
lifecycleMixin(Ga)

module.exports = Ga

// const _ = require('lodash')
// const { handleError } = require('./utils')


// function Ga(options) {
//   if (!(this instanceof Ga)) new Ga(options)

//   // 公共存储对象
//   this.store = {}
//   // 路由对象
//   this.$router = options.router(this) || {}
//   // 插件
//   Ga.plugins.forEach(plugin => plugin.install(this))
//   // 全局错误捕获
//   const error = typeof this.hooks.error === 'function' || handleError
//   process.on('uncaughtException', err => error(err))
//   // 初始化路由
//   initRouter(this)
// }

