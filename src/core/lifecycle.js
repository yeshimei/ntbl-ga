
const names = [
  'mount', 
  'beforeEach', 
  'afterEach', 
  'mounted', 
  'render',
]

function initLifecycle (app) {
  app._hooks = names.reduce((ret, res) => {
    ret[res] = []
    return ret
  }, {})
}

function lifecycleMixin (Ga) {
  names.forEach(name => {
    Ga.prototype[name] = function (fn) {
      this._addHooks(name, fn)
    }
  })
  
  Ga.prototype.$error = function (fn) {
    this._hooks.error = fn
  }
  
  Ga.prototype._callHook = async function (name, ...args) {
    await Promise.all(this._hooks[name].map(fn => fn.apply(this, args)))
  }
  
  Ga.prototype._addHooks = function (name, fn) {
    const _hooks = this._hooks[name]
    if (typeof fn === 'function' && !_hooks.includes(fn)) {
      _hooks.push(fn)
    }
  }
}


module.exports = {
  lifecycleMixin,
  initLifecycle
}