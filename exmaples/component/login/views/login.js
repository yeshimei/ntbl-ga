const inquirer = require('inquirer')
const log = require('@ntbl/log')()

module.exports = async app => {
  const { $terminal } = app

  // 暂停按键事件监听器
  // 防止在输入内容时与路由发生冲突
  $terminal.pause()

  console.log('登陆账号：');

  const answer = await inquirer.prompt([
    {
      type: 'input',
      message: 'username:',
      name: 'user'
    },
    {
      type: 'password',
      message: 'password:',
      name: 'pass'
    }
  ])

  // 清空命令行界面
  $terminal.clear()

  // loading 
  log.start(data => `${data.frame} 正在登陆，请稍等！`)
  

  // 登陆验证
  try {
    await login(answer.user, answer.pass)
    log.stop()
    console.log('登陆成功，欢迎您');
  } catch (err) {
    log.stop()
    console.log('登陆失败');
  } finally {
    // 恢复按键事件监听器
    $terminal.resume()
  }
}

async function login (user, pass) {
  await new Promise((resolve, reject) => {
   setTimeout(function () {
    if (user === 'hsy' && pass === '123456') {
      resolve()
    } else {
      reject()
    }
   }, 2000)
  })
}