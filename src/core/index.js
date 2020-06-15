import { initMixin } from './init'
import { routerMixin } from './router'

/**
 * 一个构建交互式命令行界面应用的库
 * @name Ga
 * @class
 * @author hsy <hsy.ntbl@gmail.com>
 * @param {Object} options - 选项对象
 * @param {Function} options.router - 路由
 * @param {Array} options.plugins - 插件 
 * @returns {app}
 */
export default function Ga(options) {
  if (!(this instanceof Ga)) new Ga(options)
  this._init(options)
}

initMixin(Ga)
routerMixin(Ga)