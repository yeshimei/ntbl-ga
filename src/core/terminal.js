import cl from 'clear'
import cliCursor from 'cli-cursor'
import Term from "tty-events"


/**
 * @name Terminal
 * @class
 */

class Terminal {
  constructor (options) {
    this.term = new Term()
    this._options = options
    this.term.timeout = options.timeout
  }

  /**
   * 清除屏幕
   * @memberof Terminal
   * @instance
   */
  clear () {
    if (!this._options.test) cl()
  }

  on (event, fn) {
    this.term.on(event, fn)
  }

  /**
   * 暂停终端监听
   * @memberof Terminal
   * @instance
   */
  pause () {
    cliCursor.show()  
    this.term.pause()
  }

  /**
   * 恢复终端监听
   * @memberof Terminal
   * @instance
   */
  resume () {
    cliCursor.hide()
    this.term.resume()
    if (process.stdin.isTTY) process.stdin.setRawMode(true)
  }
}

export function initTerminal (app) {
  /**
   * 终端
   * @name $terminal
   * @instance
   * @memberof Ga
   * @type {Terminal}
   */
  app.$terminal = new Terminal(app.constructor.config)
}