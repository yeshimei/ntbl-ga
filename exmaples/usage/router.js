const home = require('./views/home')
const summary = require('./views/summary')

module.exports = app => {
  return {
    routes: [
      { 
        name: 'home',
        // 挂载路由时，默认路径
        path: '/',
        component: home,
      },
      { 
        name: 'summary',
        path: '/s',
        component: summary,
      },
    ]
  }
}