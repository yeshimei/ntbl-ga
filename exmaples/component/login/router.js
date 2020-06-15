const login = require('./views/login')

module.exports = app => {
  return {
    routes: [
      {
        name: 'login',
        path: '/',
        component: login,
      },
    ]
  }
}