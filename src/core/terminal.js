const cl = require('clear')
const cliCursor = require('cli-cursor');
const term = new (require("tty-events"))

function terminalMixin (Ga) {
  term.timeout.timeout = Ga.config.timeout
  Ga.prototype.$terminal = {
    _term: term,
    clear: clear(Ga.config.clear),
    pause,
    resume,
    cursor: cliCursor
  }
}

function clear (c) {
  return function () {
   if (c) cl()
   return this
  }
}

function pause () {
 cliCursor.show()  
 term.pause()
 return this
}

function resume () {
 cliCursor.hide()
 term.resume()
 process.stdin.setRawMode(true)
 return this
}

module.exports = {
  terminalMixin
}