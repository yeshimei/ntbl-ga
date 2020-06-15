
module.exports = app => {
  const { $router } = app

  // 两秒后，自动返回到首页
  setTimeout(function () {
    $router.push('/')
    // 或者通过 name
    // $router.push('home')
  }, 2000)

  return '\n\nGa，一个构建交互式命令行界面的库。'
  + '\n\n两秒后，自动返回到首页'
}