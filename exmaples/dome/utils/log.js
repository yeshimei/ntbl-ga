const log = require('@ntbl/log')()

/* 自定义动画相关数据 */
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

// 使用 ntbl-log 的加载器
// 更好的集中管理整个项目的动画
// 详情，请参考 github 
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