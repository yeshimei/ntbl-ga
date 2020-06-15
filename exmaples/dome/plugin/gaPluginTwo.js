const chalk = require('chalk')

module.exports = options => {
  return function (app) {
    const { store } = app
    store.layout = {}

    app.$event.on('beforeEach', function (to, form, next) {
      const { chain, children } = to
      
      // 添加顶部仓库名和面包屑导航
      const name = `● ${options.name || 'Ga'} `
      const breadcrumb = chain.map(route => route.alias).join('/')
      store.layout.header = chalk.red(name + breadcrumb) + '\n\n'
  
      // 添加尾部菜单栏
      const menu = children.map(route => `${route.alias}[${route.path.map(path => path.key).join('/')}]`)
  
      chain.length > 1 && menu.push('返回[ESC]')
      
      const jumpMenu = app.$router.routes
        .filter(route => Array.isArray(route.jump))
        .map(route => `${route.alias}(${route.jump.map(el => el.path).join('/')})`)
      
      store.layout.footer = chalk.gray(`\n\n${menu.join(' | ')}\n\n${jumpMenu.join(' | ')}`)
      next()
    })
  
    app.$event.on('render', function(route) {
      route.template = store.layout.header + route.template + store.layout.footer
    })
  }
} 

