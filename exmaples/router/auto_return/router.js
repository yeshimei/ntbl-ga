const home = require('./views/home')
const summary = require('./views/summary')

module.exports = app => {
  return {
    routes: [
      {
        name: 'home',
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