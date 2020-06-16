import  _ from 'lodash'
import  {
  getChildren,
  getChain,
  combineComboKeys,
  formatRoutes,
  isCommonFn,
  isAsyncFn
}  from '../util'

let history = []
let historyIndex = 0

export function initRouter (app) {
  const router = app._options.router
  if (typeof router !== 'function') {
    throw new TypeError('Router must be a function')
  }

  /**
   * @name Router
   * @class
   */

    /**
     * 路由
     * @name $router
     * @memberof Ga
     * @instance
     * @type {Router}
    */
  app.$router = {
    push: push.bind(app),
    go: go.bind(app),
    back: back.bind(app),
    forward: forward.bind(app),
    routes: formatRoutes(router(app).routes)
  }

  /**
   * 当前路由对象
   * @name $route
   * @memberof Ga
   * @instance
   * @property {String} [key=null] - 当前路由的触发按键
   * @property {Object} [keys={}]  - 当前路由的触发按键对象
   * @property {String} [keys.name=null] - 触发按键的名称
   * @property {Boolean} [keys.ctrl=false] - 触发按键是否包含了 Ctrl 按键
   * @property {Boolean} [keys.alt=false] - 触发按键是否包含了 Alt 按键
   * @property {Boolean} [keys.shift=false] - 触发按键是否包含了 Shift 按键
   * @property {String} [path='/'] - 当前路由的路径
   * @property {Object} [route={}] - 当前路由对象（路由列表中匹配当前路径的对象）
   * @property {Array} [children=[]] - 当前路由的子路由（拥有多个路径的路由对象，仅返回符合匹配的路径）
   * @property {Array} [chain=[]] - 当前路由的路由链对象
   */
  app.$route = {
    key: null,
    keys: {},
    path: '/',
    route: {},
    children: [],
    chain: [],
  }
}

export function routerMixin (Ga) {
 
  Ga.prototype.$mount = mount
  Ga.prototype.$render = render
}

 /**
   * 挂载路由
   * @memberof Ga
   * @instance
   */
async function mount () {
  // mount 事件
  // 此时，路由未挂载，页面未渲染
  await this.$event.emit('mount')
 
  // 监听键盘事件（挂载路由）
  this.$terminal.resume()
  this.$terminal.on('keypress',  async (key = {}) => {
      let { name, ctrl } = key
      const { $router, $route } = this
      const { routes } = $router
      
      // 强制退出
      if (ctrl && name === 'c') {
         process.exit(1)
      }

      // ESC 返回
      if (name === 'escape') {
        return await $router.back()
      }

      // path 转跳
      key = combineComboKeys(key)
      const path = `${$route.path}/${key}`.replace('//', '/')
      if (routes.some(route => route.path.some(p => p.path === path))) {
        return await $router.push(path)
      }

      // jump 转跳
      const route = routes.find(route => route.jump && route.jump.find(p => p.path === key))
      
      if (route) {
        return await $router.push(route.path[0].path)
      }
    })

  // 渲染页面
  await this.$router.push(this.$route.path)
  // mounted 事件
  // 此时，路由已挂载，页面已渲染完成  
  await this.$event.emit('mounted')
}

 /**
   * 渲染页面
   * @memberof Ga
   * @instance
   */
async function render () {
  const { oldRoute, route } = this.$route

  const next = await this.$event.emit('beforeEach', this.$route, oldRoute) 
  if (next === false) return
  
  let component = route.component

  // 当组件为字符串或普通函数时，封装为 async
  if (typeof component === 'string') {
    component = async () => component
  } else if (typeof isCommonFn(component)) {
    const fn = component
    component = async ctx => fn(ctx)
  }

  if (isAsyncFn(component)) {
    component(this)
      .then(async content => {
        const template = content
          // 设置当前模板
        this.$route.template = template
        
        // 当组件未返回模板时，将由控制器交给用户
        if (template && typeof template === 'string') {
          // 清理屏幕
          this.$terminal.clear()
          // 打印
          this.$event.emit('render', this.$route)
          if (!this.constructor.config.test) {
            console.log(this.$route.template)
          }
        }

        // 后置钩子
        await this.$event.emit('afterEach', this.$route, oldRoute)
    })
  }
}

/**
 * 转跳至指定路径或名字的页面
 * 
 * @memberof Router
 * @instance
 * @param {String} path - 路径或名字
 * @param {Number} n - 当存在多个路径时，指定名字，可选择第几个路径
 */
async function push (path, n = 0) {
  const { $route,  $router } = this
  const { routes } = $router
  // 支持 name
  if (path[0] !== '/') {
    const route = routes.find(route => route.name === path)
    path = route && route.path[n].path
  }

  if (!path) return
  let paths
  let route = routes.find(route => paths =  route.path.find(p => p.path === path))
  if (!route) return

  $route._oldRoute = $route
  $route.key = paths.key
  $route.keys = paths.keys
  $route.path = path
  $route.route = route
  $route.children = getChildren(_.cloneDeep(routes), path)
  $route.chain = getChain(_.cloneDeep(routes), path)
  
  await this.$render()
  // history 
  if (path !== history[historyIndex]) {
    history = _.take(history,  historyIndex + 1)
    history.push(path)
    historyIndex = history.length - 1
  }
}

/**
 * 返回一个页面
 * 
 * @memberof Router
 * @instance
 */
async function back () {
  await this.$router.go(-1)
}

/**
 * 向前一个页面
 * 
 * @memberof Router
 * @instance
 */
async function forward () {
  await this.$router.go(1)
}

/**
 * 转跳 n 个页面，n 为正数向前，负数向后
 * 
 * @memberof Router
 * @instance
 */
async function go (n) {
  let index = historyIndex + n
  if (index < 0) index = 0
  if (index > history.length) index = history.length
  historyIndex = index
  await this.$router.push(history[index])
}