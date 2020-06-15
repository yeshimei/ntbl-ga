const home = require('./views/home')
const summary = require('./views/summary')

module.exports = app => {
  return {
    routes: [
      {
        name: 'home',
        alias: '首页',
        path: '/',
        component: home,
      },
      { 
        name: 'summary',
        alias: '查看概要',
        path: '/s',
        component: summary,
      },
    ]
  }
}