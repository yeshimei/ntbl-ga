import _ from 'lodash'

export function handleError (err) {
  console.log(err);
  process.exit(1)
}

export function isAsyncFn (value) {
  return Object.prototype.toString.call(value) === '[object AsyncFunction]'
}

export function isCommonFn (value) {
  return Object.prototype.toString.call(value) === '[object Function]'
}

export function resetPath (path) {
  return path
  .split('/')
  .map(key => key
    .split('+')
    .sort((a, b) => b.length - a.length)
    .join('+'))
  .join('/')
}

export function getRwaKey(path) {
  return _.last(path.split('/'))
}

export function getKeys (path) {
  const ks = getRwaKey(path).split('+').map(k => k.toLocaleLowerCase())
  return {
    name: _.last(ks),
    ctrl: ks.includes('ctrl'),        
    alt: ks.includes('alt'),
    shift: ks.includes('shift')
  }
}

export function isCombinationKey (path) {
  return path.split('+').some(key => ['ctrl', 'shift', 'alt'].includes(key))
}

export function combineComboKeys (key) {
  const {name, ctrl, alt, shift} = key
  return resetPath(name 
    + (ctrl ? '+ctrl' : '') 
    + (alt ? '+alt' : '') 
    + (shift ? '+shift' : ''))
}

export function formatRoutes (routes) {
  return routes.map(route => {
    const {path, jump} = route

    if (path) {
      if (typeof path === 'string') route.path = [path]

      route.path = route.path.map(p => ({
        path: resetPath(p),
        key: getRwaKey(p),
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