import Event from './event'
import config from '../config'
import { initRouter } from './router'
import { initTerminal } from './terminal'

let uid = 0

export function initMixin (Ga) {
  Ga.config = config

  Ga.prototype._init = function (options) {
    const app = this
    app._uid = uid++
    app._options = options
    app._version = "__VERSION__"
    /**
     * 公共存储对象，跨组件间共享数据
     * @name store
     * @memberof Ga
     * @type {Object}
     * @default {}
     * @instance
     */
    // 公共存储
    app.store = {}
    /**
     * 事件
     * @name $event
     * @memberof Ga
     * @instance
     * @type {Event}
    */
    app.$event = new Event
    // 初始化终端
    initTerminal(app)
    // 初始化路由
    initRouter(app)
    // 插件
    options.plugins = Array.isArray(options.plugins) ?  options.plugins : []
    
    options.plugins.forEach(plugin => plugin(app))
  }
}