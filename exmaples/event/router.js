const home = require('./views/home')
const category = require('./views/category')
const help = require('./views/help')

module.exports = app => {
  const { $event } = app
  $event.on('beforeEach', (to, from, next) => {
    const { $route, store } = app

    const bottomMenu = $route.children.map(route => `${route.alias}[${route.path[0].key}]`)

    // store 是一个全局共享数据的存储对象
    store.bottomMenu = bottomMenu

    // beforeEach 事件默认会拦截路由
    // next 方法，允许通过
    next()
  })

  $event.on('render', route => {
    route.template += ('\n\n' + app.store.bottomMenu.join(' | '))
  })


  return {
    routes: [
      {
        name: 'home',
        path: '/',
        component: home,
      },
      { 
        name: 'category',
        alias: '分类',
        path: '/c',
        component: category.show,
      
      },

      { 
        name: 'categoryCreate',
        alias: '创建',
        path: '/c/c',
        component: category.create,
      
      },

      { 
        name: 'categoryDel',
        alias: '删除',
        path: '/c/d',
        component: category.del,
      
      },

      { 
        name: 'categorySetName',
        alias: '更改名称',
        path: '/c/n',
        component: category.setName,
      
      },

      { 
        name: 'categoryMoveStar',
        alias: '移动',
        path: '/c/m',
        component: category.moveStar,
      
      },

      { 
        name: 'categoryRemoveStar',
        alias: '移除',
        path: '/c/r',
        component: category.removeStar,
      
      },

      {
        name: 'help',
        alias: '帮助',
        path: '/h',
        component: help,
      }
    ]
  }
}