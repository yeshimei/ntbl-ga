const _ = require('lodash')

function handleError (err) {
  console.log(err);
  process.exit(1)
}

function getChildren(routes, path) {
  const children = routes.filter(route => {
    route.path = route.path.filter(p => RegExp(`^\\${path}\\/?[^\\/]*$`).test(p.path))
    return route.path.length
  })
  
  return _.tail(children)
}

function getChain(routes, path) {
  const chain = []
  // 根路径的特殊处理
  const keys = path === '/' ? ['/'] : path.split('/')

  keys.forEach((key, index) => {
    const othPath = _.take(keys, index + 1).join('/') || '/'
    const route = routes.find(route => route.path.find(p => p.path === othPath))
    if (route) chain.push(route)
  })
  return chain
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

function getRwaKey(path) {
  return _.last(path.split('/'))
}

function getKeys (path) {
  const ks = getRwaKey(path).split('+').map(k => k.toLocaleLowerCase())
  return {
    name: _.last(ks),
    ctrl: ks.includes('ctrl'),        
    alt: ks.includes('alt'),
    shift: ks.includes('shift')
  }
}

function isCombinationKey (path) {
  return path.split('+').some(key => ['ctrl', 'shift', 'alt'].includes(key))
}

function combineComboKeys (key) {
  const {name, ctrl, alt, shift} = key
  return resetPath(name 
    + (ctrl ? '+ctrl' : '') 
    + (alt ? '+alt' : '') 
    + (shift ? '+shift' : ''))
}

function formatRoutes (routes) {
  return routes.map(route => {
    const {path, jump} = route

    if (path) {
      if (typeof path === 'string') route.path = [path]

      route.path = route.path.map(p => ({
        path: resetPath(p),
        rawKey: getRwaKey(p),
        keys: getKeys(p) 
      }))
    } else {
      throw new TypeError(`Specify at least one legal path for the ${route.name} route`)
    }

    

    if (jump) {
      if (typeof jump === 'string') route.jump = [jump]

      if (!route.jump.every(p => isCombinationKey(p))) {
        throw new TypeError(`The jump option of the ${route.name} route must be a key combination (ctrl/alt/shift)`)
      }

      route.jump = route.jump.map(p => ({
        path: resetPath(p),
        keys: getKeys(p)
      }))
    }

    return route
  })
}

module.exports = {
  handleError,
  getChildren,
  getChain,
  combineComboKeys,
  formatRoutes
}