const log = require('../log')
const getUserData = throttle(_getUserData)

module.exports = async app => {
  const { store, $terminal } = app

  const bottomMenu = `\n\n其他页面[t]`

  $terminal.clear()
  
  if (store.userList) {
    const userList = store.userList
    console.log(userList.map(item => `${item.user}(${item.age})`).join('\n') + bottomMenu);
  } else {
    // 暂停键盘事件
    // 禁止路由切换界面
    $terminal.pause()
    log.start(data => `${data.frame} 正在拉取用户数据，请稍等`)
    const userList = await getUserData()
    if (userList) {
      log.stop()
      store.userList = userList
      await app.$render()
      // 恢复事件监听
      $terminal.resume()
    }
  }
}

function _getUserData () {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve([
        { user: 'sunny', age: 17 },
        { user: 'lao wang', age: 57 },
        { user: 'ma yun', age: 18 },
      ])
    }, 5000)
   })
}

// 异步函数调用完成后
// 才允许再一次执行
function throttle (fn) {
  let lock = false
  return async function (...args) {
    if (!lock) {
      lock = true
      return await fn(...args)
      lock = false
    }
  }
}