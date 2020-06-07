
module.exports = {
  // app.$terminal.clear() 方法的开启与关闭
  // 测试时，推荐关闭此方法
  clear: true,
  // 默认，关闭转义序列，ESC 键无等待响应耗时
  // https://github.com/dd-pardal/tty-events#escape-key
  timeout: 0
}