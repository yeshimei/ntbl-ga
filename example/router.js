const package = require('./package.json')
const home = require('./views/home')
const star = require('./views/star')
const search = require('./views/search')
const category = require('./views/category')
const help = require('./views/help')
const log = require('./utils/log')

module.exports = app => {
  const { chalk, store} = app
  store.layout = {}

  app.beforeEach(function (to, form , next) {
    log.stop()
    next()
  })

  return {
    routes: [
      { 
        name: 'home',
        alias: '首页',
        path: '/',
        jump: 'alt+x',
        component: home,
        description: '首页'
      },
      
      { 
        name: 'star',
        alias: '关注',
        path: '/t',
        component: star.show,
        description: '查看所有已关注的关注仓库'},

      { 
        name: 'starAddCategory',
        alias: '添加分类',
        path: '/t/c',
        component: star.addCategory,
        description: '将关注的仓库添加到分类'},

      { 
        name: 'starRemoveCategory',
        alias: '移除分类',
        path: '/t/d',
        component: star.removeCategory,
        description: '将关注的仓库从分类中移除'},

      { 
        name: 'starUnfollow',
        alias: '取消关注',
        path: '/t/u',
        component: star.unfollow,
        description: '取消关注已关注的仓库'},

      { 
        name: 'search',
        alias: '搜索',
        path: '/s',
        component: search.show,
        description: '搜索仓库'
      },

      { 
        name: 'searchAddCategoryAndFollow',
        alias: '添加分类并关注',
        path: '/s/f',
        component: search.addCategoryAndFollow,
        description: '将创见添加到分类并关注'
      },

      { 
        name: 'category',
        alias: '分类',
        path: '/c',
        component: category.show,
        description: '分类管理页'
      },

      { 
        name: 'categoryCreate',
        alias: '创建',
        path: '/c/c',
        component: category.create,
        description: '创建一个分类'
      },

      { 
        name: 'categoryDel',
        alias: '删除',
        path: '/c/d',
        component: category.del,
        description: '删除一个分类'
      },

      { 
        name: 'categorySetName',
        alias: '更改名称',
        path: '/c/n',
        component: category.setName,
        description: '更改分类的名称'
      },

      { 
        name: 'categoryMoveStar',
        alias: '移动',
        path: '/c/m',
        component: category.moveStar,
        description: '移动仓库'
      },

      { 
        name: 'categoryRemoveStar',
        alias: '移除',
        path: '/c/r',
        component: category.removeStar,
        description: '移除仓库'
      },

      {
        name: 'help',
        alias: '帮助',
        path: 'h',
        component: help,
        description: '查看使用说明'
      }
    ],
  }
}