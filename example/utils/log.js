const log = require('@ntbl/log')()

log.addSpinner('line', {
  "interval": 80,
  "frames": [
    "-             -",
    " -           - ",
    "  -         -  ",
    "   -       -   ",
    "    -     -    ",
    "     -   -     ",
    "      - -      ",
    "       -       ",
    "      - -      ",
    "     -   -     ",
    "    -     -    ",
    "   -       -   ",
    "  -         -  ",
    " -           - ",
    "-             -",
  ]
})


log.register('home', {
  logo: {
    name: 'line',
    color: 'red',
    text: data => data.args[0](`${data.frame}`)
  }
})

log.register('star', {
  loading: data => `${data.frame} 正在拉取关注列表数据`
})


module.exports = log