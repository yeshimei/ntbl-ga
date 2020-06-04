const clear = require('clear')
const term = new (require("tty-events"))

function router (app) {
  
  app.$route = {
    router: {},
    children: [],
    path: '/',
  }

  app.$mount = mount
  app.$router.push = push.bind(app)

  app.$terminal = {
    clear,
    pause,
    resume
  }
}

async function mount () {
  await this.$router.push(this.$route.path)
  if (process.stdin.isTTY) process.stdin.setRawMode(true)
  term.on('keypress', async (key = {}) => {
      const {name, ctrl} = key

      // 强制退出
      if (ctrl && name === 'c') {
         process.exit(1)
      }

      // ESC 返回
      if (name === 'escape') {
        const newPath = this.$route.path = this.$route.path.split('/').slice(0, -1).join('/') || '/'
        await this.$router.push(newPath)
        return
      }

      const newPath = `${this.$route.path}/${name}`.replace('//', '/')
      await this.$router.push(newPath)
    })
}

async function push (url) {
  const { routes, beforeEach, afterEach = noop } = this.$router
  let route = routes.find(route => route[url[0] === '/' ? 'path' : 'name'] === url)
  if (!route) return
  url = route.path
  
  let { component } = route
  let template = typeof component === 'function' 
    ? await component(this)
    : component
  if (template == null) return

  const oldRoute = this.$route

  // 设置当前路由
  this.$route.route = route
  // 设置所有子路由
  this.$route.children = getChildren(routes, url)
  // 设置当前路径
  this.$route.path = url
  // 设置当前模板
  this.$route.template = template

  // 前置钩子
  let next = true
  if (typeof beforeEach === 'function') {
    next = false
    await beforeEach(this.$route || {}, oldRoute || {}, path => {
      if (path) return this.$router.push(path)
      else next = true
    })
  }

  if (!next) return

  // 清理屏幕
  clear()
  // 解析模板并打印
  console.log(this.$route.template)
  // 后置钩子
  await afterEach(this.$route || {}, oldRoute || {})
}

function pause () {
  term.pause()
}

function resume () {
  term.resume()
  process.stdin.setRawMode(true)
}

function getChildren(routes, url) {
  return routes.filter(route => RegExp(`^\\${url}/[^/]*$`).test(route.path))
}

function noop () {}

module.exports = router