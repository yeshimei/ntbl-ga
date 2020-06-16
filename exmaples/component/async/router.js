const home = require('./views/home')
const other = require('./views/other')
const log = require('./log')

module.exports = app => {
  const { $event } = app
  $event.on('beforeEach', function (to, from, next) {
    // 界面切换时，关闭 log 的动画
    log.stop()
    next()
  })

  return {
    routes: [
      {
        name: 'home',
        path: '/',
        component: home,
      },
      {
        name: 'other',
        path: '/t',
        component: other,
      },
    ]
  }
}