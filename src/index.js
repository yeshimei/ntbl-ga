const initRouter = require('./router')
const _ = require('lodash')
const { noop, handleError } = require('./utils')

Ga.config = {
  // 自动清除屏幕
  clear: true,
}

Ga.plugins = []

Ga.use = function (plugin) {
  if(plugin && typeof plugin.install === 'function' && !Ga.plugins.includes (plugin)){
    Ga.plugins.push(plugin)
  }
}


function Ga(options) {
  if (!(this instanceof Ga)) new Ga(options)
  // 公共存储对象
  this.store = {}
  // 生命周期钩子对象
  this.hooks = { mount: [], beforeEach: [], afterEach: [], mounted: [], render: []}
  // 路由对象
  this.$router = options.router(this) || {}
  // 插件
  Ga.plugins.forEach(plugin => plugin.install(this))
  // 全局错误捕获
  const error = typeof this.hooks.error === 'function' || handleError
  process.on('uncaughtException', err => error(err))
  // 初始化路由
  initRouter(this)
}


['mount', 'beforeEach', 'afterEach', 'mounted', 'render'].forEach(name => {
  Ga.prototype[name] = function (fn) {
    this._addHooks(name, fn)
  }
})

Ga.prototype.error = function (fn) {
  this.hooks.error = fn
}

Ga.prototype._executeHook = async function (name, ...args) {
  await Promise.all(this.hooks[name].map(fn => fn.apply(this, args)))
}

Ga.prototype._addHooks = function (name, fn) {
  const hooks = this.hooks[name]
  if (typeof fn === 'function' && !hooks.includes(fn)) {
    hooks.push(fn)
  }
}


module.exports = Ga