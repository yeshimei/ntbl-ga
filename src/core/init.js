const config = require('../config')
const { initRoute } = require('./router')
const { initLifecycle } = require('./lifecycle')

let uid = 0

function initMixin (Ga) {

  Ga.config = config
  Ga._plugins = []

  Ga.use = use

  Ga.prototype._init = function (options) {
    const app = this
    app._uid = uid++
    // 选项
    app._options = options
    // 公共存储
    app.store = {}
    
    initLifecycle(app)

     // 插件
     if (Ga._plugins.length) {
      Ga._plugins.forEach(plugin => plugin(app))
    }
    console.log(111, this._hooks);
    initRoute(app)

    
    
  }
}



function use (plugin) {
  if (typeof plugin === 'function' && !this._plugins.includes(plugin)){
    this._plugins.push(plugin)
  }
}

module.exports = {
  initMixin
}