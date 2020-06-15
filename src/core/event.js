/**
 * @name Event
 * @class
 */
export default class Event {
  constructor () {
    this._events = []
  }

  /**
   * 订阅事件  
   * - mount 
   * - mounted
   * - beforeEach
   * - afterEach
   * @memberof Event
   * @instance
   * @param {String} name - 事件名
   * @param {Function} fn - 事件函数
   * @param {*} ctx - this 指向
   */
  on(name, fn, ctx) {
    const events = this._events
    if (typeof fn === 'function' && !events.some(event => event.name == name && event.fn == fn)) {
      events.push({
        name,
        fn,
        ctx
      })
    }
  }

  async emit(name, ...args) {
    const events = this._events.filter(event => event.name === name)

    if (events.length) {
      if (name === 'beforeEach') {
        for (let event of events) {
          let next = false
          await event.fn.call(event.ctx, ...args, function (path) {
            next = true
            if (path) this.$router.push(path)
          })
          // 当存在一个 beforeEach 事件内部未调用调用 next
          // 通知路由中断执行
          if (!next) return false
        }
        // 所有的 beforeEach 事件内部都正确的调用了 next
        // 通知路由继续执行
        return true
      }

      for (let event of events) {
        await event.fn.apply(event.ctx, args)
      }
    }
  }
}