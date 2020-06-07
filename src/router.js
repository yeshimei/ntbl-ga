const cl = require('clear')
const cliCursor = require('cli-cursor');
const term = new (require("tty-events"))
const _ = require('lodash')
const { noop } = require('./utils')

async function router (app) {
  app.$route = {
    route: {},
    children: [],
    path: '/',
  }
  app.$router.history = []
  app.$router.historyIndex = 0
  app.$mount = mount
  app.$render = render
  app.$router.push = push.bind(app)
  app.$router.back = back.bind(app)
  app.$router.forward = forward.bind(app)
  app.$router.go = go.bind(app)
  app.$terminal = {
    clear: clear(app.constructor.config.clear),
    pause,
    resume,
    cursor: cliCursor
  }

  formatRoutes(app.$router.routes)

   // mount 钩子
   await app._executeHook('mount')
   // 挂载路由
   await app.$mount()
   // mounted 钩子
   await app._executeHook('mounted')
}

async function mount () {
  await this.$router.push('/')
  this.$terminal.resume()

  term.on('keypress', async (key = {}) => {
      let { name, ctrl } = key
      const { $router, $route } = this

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
      if ($router.routes.some(route => route.path.some(p => p.path === path))) {
        return $router.push(path)
      }

      // jump 转跳
      const route = $router.routes.find(route => route.jump && route.jump.find(p => p.path === key))
      
      if (route) {
        return $router.push(route.path[0].path)
      }
    })
}

async function render () {
  const { oldRoute, route } = this.$route
  const hooks = this.hooks
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
    await this._executeHook('render', this.$route)
    console.log(this.$route.template)
  }
  
 
  // 后置钩子
  await this._executeHook('afterEach', this.$route, oldRoute)
}

function clear (clear) {
   return function () {
    if (clear) cl()
    return this
   }
}

function pause () {
  cliCursor.show()  
  term.pause()
  return this
}

function resume () {
  cliCursor.hide()
  term.resume()
  process.stdin.setRawMode(true)
  return this
}


function getChildren(routes, path) {

  const children = routes.filter(route => {
    route.path = route.path.filter(p => RegExp(`^\\${path}\\/?[^\\/]*$`).test(p.path))
    return route.path.length
  })
  
  return _.tail(children)
}

function getChain(routes, path) {
  const chain = []
  // 根路径的特殊处理
  const keys = path === '/' ? ['/'] : path.split('/')

  keys.forEach((key, index) => {
    const othPath = _.take(keys, index + 1).join('/') || '/'
    const route = routes.find(route => route.path.find(p => p.path === othPath))
    if (route) chain.push(route)
  })
  return chain
}

function resetPath (path) {
  return path
  .split('/')
  .map(key => key
    .split('+')
    .sort((a, b) => b.length - a.length)
    .join('+'))
  .join('/')
}


async function push (path, n = 0) {
  const { $route, $router } = this
  const { history, historyIndex, routes} = $router
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
    $router.history = _.take(history,  historyIndex + 1)
    $router.history.push(path)
    $router.historyIndex = $router.history.length - 1
  }
}

async function back () {
  await this.$router.go(-1)
}

async function forward () {
  await this.$router.go(1)
}

async function go (n) {
  const { historyIndex, history, push} = this.$router
  let index = historyIndex + n

  if (index < 0) index = 0
  if (index > history.length) index = history.length
  
  this.$router.historyIndex = index
  await push(history[index])
}


function getRwaKey(path) {
  return _.last(path.split('/'))
}

function getKeys (path) {
  const ks = getRwaKey(path).split('+').map(k => k.toLocaleLowerCase())
  return {
    name: _.last(ks),
    ctrl: ks.includes('ctrl'),        
    alt: ks.includes('alt'),
    shift: ks.includes('shift')
  }
}

function isCombinationKey (path) {
  return path.split('+').some(key => ['ctrl', 'shift', 'alt'].includes(key))
}

function combineComboKeys (key) {
  const {name, ctrl, alt, shift} = key
  return resetPath(name 
    + (ctrl ? '+ctrl' : '') 
    + (alt ? '+alt' : '') 
    + (shift ? '+shift' : ''))
}

function formatRoutes (routes) {
  return routes.map(route => {
    const {path, jump} = route

    if (path) {
      if (typeof path === 'string') route.path = [path]

      route.path = route.path.map(p => ({
        path: resetPath(p),
        rawKey: getRwaKey(p),
        keys: getKeys(p) 
      }))
    } else {
      throw new TypeError(`Specify at least one legal path for the ${route.name} route`)
    }

    

    if (jump) {
      if (typeof jump === 'string') route.jump = [jump]

      if (!route.jump.every(p => isCombinationKey(p))) {
        throw new TypeError(`The jump option of the ${route.name} route must be a key combination (ctrl/alt/shift)`)
      }

      route.jump = route.jump.map(p => ({
        path: resetPath(p),
        keys: getKeys(p)
      }))
    }

    return route
  })
}

module.exports = router