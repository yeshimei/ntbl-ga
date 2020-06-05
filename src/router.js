const clear = require('clear')
const cliCursor = require('cli-cursor');
const term = new (require("tty-events"))
const { noop } = require('./utils')
const pullAt = require('lodash/pullAt')
const last = require('lodash/last')
const tail = require('lodash/tail')
const take = require('lodash/take')
const isObject = require('lodash/isObject')
const cloneDeep = require('lodash/cloneDeep')

function router (app) {
  
  app.$route = {
    route: {},
    children: [],
    path: '/',
  }

  app.$router.history = []
  app.$router.historyIndex = 0

  app.$router.routes = formatRoutes(app.$router.routes)
  
  app.$mount = mount
  app.$render = render
  app.$router.push = push.bind(app)
  app.$router.back = back.bind(app)
  app.$router.forward = forward.bind(app)
  app.$router.go = go.bind(app)
  
  app.$terminal = {
    clear,
    pause,
    resume,
    cursor: cliCursor
  }
}

async function mount () {
  await this.$router.push(this.$route.path)
  this.$terminal.resume()
  
  term.on('keypress', async (key = {}) => {
      const {name, ctrl, alt, shift} = key

      // 强制退出
      if (ctrl && name === 'c') {
         process.exit(1)
      }

      // ESC 返回
      if (name === 'escape') {
        return await this.$router.back()
      }
      

      // 组合键
      let newPath = resetPath(name 
        + (ctrl ? '+ctrl' : '') 
        + (alt ? '+alt' : '') 
        + (shift ? '+shift' : ''))
      
      // 默认以线性切换界面
      // 当 jump = true 时，则可以在任意界面切换到其他界面  
      const jump = this.$router.routes.some(route => {
        const path = route.path.find(path => path.rawKey === newPath)
        return path && path.jump
      })
     
      if (jump) {
        this.$router.push('/' + newPath)
      } else {
        this.$router.push(`${this.$route.path}/${newPath}`.replace('//', '/'))
      }
    })
}

async function render () {
  const { routes, beforeEach, afterEach = noop } = this.$router
  const oldRoute = this.$route
  const path = this.$route.path
  let next = true
  let template

  let route = routes.find(route => route.rawPath.includes(path))
  if (!route) return

  const component = route.component
  template = typeof component === 'function' ? await component(this) : component
  if (template == null) return

  // 设置当前路由
  this.$route.route = route
  // 设置所有子路由
  this.$route.children = getChildren(cloneDeep(routes), path)
  // 设置路由链
  this.$route.chain = getChain(cloneDeep(routes), path)
  // 设置当前模板
  this.$route.template = template

  // 前置钩子
  if (typeof beforeEach === 'function') {
    next = false
    await beforeEach(this.$route, oldRoute, path => {
      if (path) return this.$router.push(path)
      else next = true
    })
  }
  if (!next) return

  // 清理屏幕
  if(this.$config.autoClear) this.$terminal.clear()
  // 打印
  console.log(this.$route.template)
 
  // 后置钩子
  await afterEach(this.$route, oldRoute)
}


function pause () {
  cliCursor.show()  
  term.pause()
}

function resume () {
  cliCursor.hide()
  term.resume()
  process.stdin.setRawMode(true)
}


function getChildren(routes, path) {
  const children = routes.filter(route => {
    route.path = route.path.filter(p => RegExp(`^\\${path}\\/?[^\\/]*$`).test(p.path))
    return route.path.length
  })
  
  return tail(children)
}

function getChain(routes, path) {
  const chain = []
  // 根路径的特殊处理
  const keys = path === '/' ? ['/'] : path.split('/')

  keys.forEach((key, index) => {
    const othPath = take(keys, index + 1).join('/') || '/'
    const route = routes.find(route => route.rawPath.includes(othPath))
    if (route) chain.push(route)
  })

  return chain.reverse()
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


async function push (path) {
  const { history, historyIndex, routes} = this.$router

  // 支持 name
  if (path[0] !== '/') {
    const route = routes.filter(route => route.name === path)
    path = route && route.rawPath[0]
  }
  if (!path) return
  
  this.$route.path = path
  await this.$render()

  if (path !== history[historyIndex]) {
    this.$router.history = take(history,  historyIndex + 1)
    this.$router.history.push(path)
    this.$router.historyIndex = this.$router.history.length - 1
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
  return last(path.split('/'))
}

function getKeys (rawKey) {
  const ks = rawKey.split('+').map(k => k.toLocaleLowerCase())
  return {
    name: last(ks),
    ctrl: ks.includes('ctrl'),        
    alt: ks.includes('alt'),
    shift: ks.includes('shift')
  }
}

function isIncludeCombinationKey (path) {
  return path.substring(1).split('+').some(key => ['ctrl', 'shift', 'alt'].includes(key))
}

function formatRoutes (routes) {
  return routes.map(route => {
    // 支持字符串和对象语法
    if (!Array.isArray(route.path)) route.path = [route.path]
    // 数组语法
    route.path = route.path
    .map(path => {
      if (typeof path === 'string') {
        return {
          path,
          jump: false
        }
      } 
      
      if (isObject(path)) {
        // 仅支持单个组合键进行转跳
        path.jump = path.jump && isIncludeCombinationKey(path.path)
        return path
      }
    })
    // 调整组合键的顺序
    .map(path => {
      path.path = resetPath(path.path)
      // 按键
      path.rawKey = getRwaKey(path.path)
      // 按键对象
      path.keys = getKeys(path.rawKey)
      return path
    })

    route.rawPath = route.path.map(path => path.path)
    return route
  })
}

module.exports = router