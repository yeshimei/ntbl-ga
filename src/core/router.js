const _ = require('lodash')
const {
  getChildren,
  getChain,
  combineComboKeys,
  formatRoutes
} = require('../util')

let history = []
let historyIndex = 0

function routeMixin (Ga) {
  Ga.prototype.$mount = mount
  Ga.prototype.$render = render
}

async function initRoute (app) {
  const router = app._options.router(app)

  app.$router = {
    push: push.bind(app),
    go: go.bind(app),
    back: back.bind(app),
    forward: forward.bind(app),
    routes: formatRoutes(router.routes)
  }  

  app.$route = {
    key: null,
    keys: {},
    path: '/',
    route: {},
    children: [],
    chain: [],
  }

  await app._callHook('mount')
  await app.$mount()
  await app._callHook('mounted')
}

async function mount () {
  await this.$router.push(this.$route.path)
  this.$terminal.resume()
  
  this.$terminal._term.on('keypress', async (key = {}) => {
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
        return $router.push(path)
      }

      // jump 转跳
      const route = routes.find(route => route.jump && route.jump.find(p => p.path === key))
      
      if (route) {
        return $router.push(route.path[0].path)
      }
    })
}

async function render () {
  const { oldRoute, route } = this.$route
  const hooks = this._hooks
  let next = true

   // 前置钩子
  if (hooks.beforeEach.length) {
    await Promise.all(hooks.beforeEach.map(fn => {
      next = false

      return fn(this.$route, oldRoute, path => {
        if (path) return this.$router.push(path)
        else next = true
      })
    }))
  }
  
  if (!next) return

  const component = route.component
  let = template = typeof component === 'function' ? await component(this) : component
  
  // 设置当前模板
  this.$route.template = template
  
  // 当组件未返回模板时，将由控制器交给用户
  if (this.$route.template) {
    // 清理屏幕
    this.$terminal.clear()
    // 打印
    await this._callHook('render', this.$route)
    console.log(this.$route.template)
  }
  
 
  // 后置钩子
  await this._callHook('afterEach', this.$route, oldRoute)
}


async function push (path, n = 0) {

  const { $route,  $router } = this
  const { routes } = $router
  
  // 支持 name
  if (path[0] !== '/') {
    const route = routes.find(route => route.name === path)
    path = route && route.path[n]
  }
  if (!path) return
  let route = routes.find(route => route.path.some(p => p.path === path))
  if (!route) return
  
  $route._oldRoute = $route
  $route.path = path
  $route.route = route
  $route.children = getChildren(_.cloneDeep(routes), path)
  $route.chain = getChain(_.cloneDeep(routes), path)
  await this.$render(path)
  // history 
  if (path !== history[historyIndex]) {
    history = _.take(history,  historyIndex + 1)
    history.push(path)
    historyIndex = history.length - 1
  }
}

async function back () {
  await this.$router.go(-1)
}

async function forward () {
  await this.$router.go(1)
}

async function go (n) {
  let index = historyIndex + n
  if (index < 0) index = 0
  if (index > history.length) index = history.length
  historyIndex = index
  await this.$router.push(history[index])
}

module.exports = {
  routeMixin,
  initRoute
}