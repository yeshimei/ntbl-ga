
module.exports = app => {
  const { $route } = app

  const bottomMenu = $route.children.map(route => `${route.alias}[${route.path[0].key}]`)

  return '\n\n欢迎来到 Ga，这是一个简单的用例'
  + '\n\n' + bottomMenu.join(' | ')
}