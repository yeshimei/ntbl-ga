# Ga

[![GitHub](https://img.shields.io/badge/GitHub-yeshimei-green.svg)](https://github.com/yeshimei/ntbl-ga.git) [![npm](https://img.shields.io/npm/v/@ntbl/ga.svg)](https://www.npmjs.com/package/@ntbl/ga) [![MIT](https://img.shields.io/npm/l/express.svg)](https://github.com/yeshimei/ntbl-ga.git)

Ga，一个构建交互式命令行界面的库。

[**API Documentation**](https://yeshimei.github.io/ntbl-ga/)

- [Installation](#Installation)
- [Usage](#Usage)
- [Router](#Router)
- [Component](#Component)
- [Terminal](#Terminal)
- [Event](#Event)
- [Plugin](#Plugin)
- [进阶](#进阶)
  - [异步与同步流程](#异步与同步流程)
  - [动画](#动画)

Ga 的核心是一个基于按键（组合键）的路由器，当运行命令行脚本时，Ga 将监听键盘事件（keypress），用户通过单击不同按键切换到对应的命令行界面。

它很小，却能轻松配合各种命令行相关库和脑子里奇妙创意，构建出漂亮且强大的交互式命令行应用。

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200613181348.gif)  
[ ☞ exmaples/dome](https://github.com/yeshimei/ntbl-ga/tree/dev/exmaples/dome)

目前，Ga 能做到的事情：

- 异步（async/await）
- 动画（[ntbl-log](https://github.com/yeshimei/ntbl-log) ...）
- 交互式（[inquirer](https://github.com/SBoudrias/Inquirer.js)，[enquirer](https://github.com/enquirer/enquirer) ...）
- 插件扩展

# Installation

```bash
npm i @ntbl/ga --save
```

# Usage

1. 引入

```js
// index.js

const Ga = require('@ntbl/ga')

// or

import Ga from '@ntbl/ga'
```

2. 实例化并手动挂载路由

```js
// 引入路由
const router = require('./router')

// 实例化
const app = new Ga({
  router
})

// 手动挂载
app.$mount()
```

3. 声明路由

```js
// router.js

const home = require('./views/home')
const summary = require('./views/summary')

module.exports = app => {
  return {
    routes: [
      { 
        name: 'home',
        // 挂载路由时，默认路径
        path: '/',
        component: home,
      },
      { 
        name: 'summary',
        path: '/s',
        component: summary,
      },
    ]
  }
}
```

4. 编写组件

```js
// views/home.js

module.exports = app => {
  return '\n\n欢迎来到 Ga，这是一个简单的用例'
  + '\n\n请单击按键 s，查看概要'
}
```

```js
// views/summary.js

module.exports = app => {
  return '\n\nGa，一个构建交互式命令行界面的库。'
  + '\n\n单击按键 ESC 返回'
}
```

5. 运行脚本


```bash
ndoe index.js
```


![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200613194558.gif)  
[ ☞ exmaples/usage](https://github.com/yeshimei/ntbl-ga/tree/dev/exmaples/usage)


# Router

Ga 路由（router）与 SPA 单页 web 应用（single page web application）或 web 框架的路由存在以下差异：

- Ga 路由的路径（path）是一条由按键名（key）组成的链（线性）

```js
/           // 挂载时，默认路径
/s          // 第一步，用户单击按键 s
/s/t        // 第二步，用户再次单击按键 t
/s/t/alt+d  // 第三步，用户最后单击组合键 alt+d
```

- Ga 路由通过组合键实现页面之间的转跳（非线性）


```js
// 无论在任何页面单击组合键 alt+x
// 直接转跳到 home 页面
{
  name: 'home'
  path: '/',
  jump: 'alt+x',
  component: home
}
```

- Ga 路由的 `path` 与 `jump` 支持同时指定多个值。


```js
{
  name: 'star'
  path: ['/s', '/c/s'],
  jump: ['alt+s', 'shift+alt+s'],
  component: star
}
```

在组件内部，使用 [app.$router](https://yeshimei.github.io/ntbl-ga/Router.html) 上的一些路由方法精确控制页面转跳。

```js
// views/summary.js

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
```

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200613194702.gif)  
[ ☞ exmaples/router/auto_return](https://github.com/yeshimei/ntbl-ga/tree/dev/exmaples/router/auto_return)

每当页面渲染之前，[app.$route](https://yeshimei.github.io/ntbl-ga/Ga.html) 都会更新当前页面的路由信息。这样，我们在页面底部中加入菜单导航。

```js
// views/home.js

module.exports = app => {
  const { $route } = app

  const bottomMenu = $route.children.map(route => `${route.alias}[${route.path[0].key}]`)

  return '\n\n欢迎来到 Ga，这是一个简单的用例'
  + '\n\n' + bottomMenu.join(' | ')
}
```

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200613200451.png)  
[ ☞ exmaples/router/bottom_menu](https://github.com/yeshimei/ntbl-ga/tree/dev/exmaples/router/bottom_menu)

请注意，Router 在内部监听以下按键：
- `ESC` 按键，返回到历史记录（history）的上一个界面。
- `Ctrl+c` 结束程序运行


# Component

组件（component）包含用户编写的业务逻辑与界面视图逻辑。

在一个组件中，一个业务可能有多个分支逻辑并多次更新当前界面的视图。为了极大地保持代码的完整和可控性，视图完全交由组件处理。

比如，我们轻松地配合 [inquirer](https://github.com/SBoudrias/Inquirer.js) 实现一个账号登陆的组件。



```js
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
```

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200613210049.gif)  
[ ☞ exmaples/component/login](https://github.com/yeshimei/ntbl-ga/tree/dev/exmaples/component/login)

# Terminal

[app.$terminal](https://yeshimei.github.io/ntbl-ga/Terminal.html) 上有一组处理命令行的方法。

- clear() - 清空命令行
- pause() - 暂停按键事件监听。

在使用第三方交互式库时，必须调用此方法，避免输入内容时与路由转跳之间发生冲突。

- resume() - 恢复按键事件监听。



```js
app.$terminal.pause()

// 第三方交互库

app.$terminal.resume()
```

# Event

在 Ga 实例生命周期里，在不同时期分别会触发以下事件：
- mount(app) - 在挂载之前触发，仅触发一次。
- mounted(app) - 在挂载之后触发，此时，页面已渲染。仅触发一次。
- beforeEach(to, from, next) - 在组件每次调用之前触发。
- render(route) - 在页面渲染之前触发（注意，当组件未返回任何内容时，此事件不会触发）。
- afterEach(to, from) - 在页面渲染之后触发

利用事件，我们为每个页面添加底部导航。

```js
// router.js

module.exports = app => {
  const { $event } = app
  $event.on('beforeEach', (to, from, next) => {
    const { $route, store } = app

    const bottomMenu = $route.children.map(route => `${route.alias}[${route.path[0].key}]`)

    // store 是一个全局共享数据的存储对象
    store.bottomMenu = bottomMenu

    // beforeEach 事件默认会拦截路由
    // next 方法，允许通过
    next()
  })

  $event.on('render', route => {
    route.template += ('\n\n' + app.store.bottomMenu.join(' | '))
  })
  
  /* 路由声明 */
}
```

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200613214219.gif)  
[ ☞ exmaples/event](https://github.com/yeshimei/ntbl-ga/tree/dev/exmaples/event)

当一个事件被注册多个函数时，包括异步函数。无论何种情况下，都将以同步队列的方式按顺序调用， 避免条件竞争导致不可预测性。

```js
// fn2 异步调用完成后
// 才允许 fn3 调用
$event.on('beforeEach', async fn2)
$event.on('beforeEach', async fn3)
```


# Plugin

Ga 拥有一个简便的插件（plugin） 机制，方便把一些常用的逻辑封装重复使用。

```js
// index.js

// 引入插件
const two = require('./plugin/two')
const router = require('./router')

const ga = new Ga({
  router,
  // 引入插件
  plugins: [ two ]
})

ga.$mount()
```

每个插件其实是一个函数，app（实例）作为参数。因此，我们可以很多事情，比如，挂载一些常用工具函数，处理一些生命周期事件等等。

```js
// plugin/two.js

module.exports = app => {
 /* 插件内容 */   
}
```

这里有一个复杂的插件例子，[gaPluginTwo](https://github.com/yeshimei/ntbl-ga/blob/dev/exmaples/dome/plugin/gaPluginTwo.js)，为每个页面自动生成顶部logo、面包屑导航与底部导航菜单。

目前，作者有计划发布一些 [通用的插件](https://github.com/yeshimei/ntbl-ga/projects)。除了上面的例子外，还比如
- 生成一个带动画的首页
- 介绍各种按键的使用帮助页面

当然，非常欢迎您提交一个 [pull requests](https://github.com/yeshimei/ntbl-ga/pulls) 发布您的插件，我会收录到这个项目里。

# 进阶

## 异步与同步流程

Ga 构建在 `async/await` 异步流程上，路由实例上所有的方法都是异步函数。**组件也是异步函数**。这有能力使我们在获取接口数据、处理大量数据或一些耗时 I/O 操作时不阻塞进程，提供给用户一个良好的使用体验。

```js
// 展示用户数据的界面
module.exports = async app => {
  const { store, $terminal } = app
  
  if (store.userList) {
    /* 展示用户数据 */
  } else {
    /* 获取用户数据 */
    try {
     /* 返回数据成功 */
      const userList = await getUserData()
      if (userList) {
        // 保存数据
        store.userList = userList
        // 重新渲染页面
        await app.$render()
      } else {
        /* 返回数据为空的处理 */  
      }
    } catch (err) {
      /* 异常处理 */
    }
  }
}
```

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200616124632.gif)  
[ ☞ exmaples/conponent/async](https://github.com/yeshimei/ntbl-ga/tree/dev/conponent/async)

异步流程应用，在带给用户良好体验同时也会增加开发复杂度，但是这一切都是值得的。有些场景下，为了直观地引导用户（比如登录）。在同步流程中，在开始之前使用 `app.$terminal.pause()` 方法暂停键盘事件监听以禁止路由切换界面。在结束之后使用 `app.$terminal.resume()` 方法恢复事件监听。

```js
// views/home.js

// 展示用户数据的界面
module.exports = async app => {
  const { store, $terminal } = app
  
  if (store.userList) {
    /* 展示用户数据 */
  } else {
    // 暂停键盘事件
    // 禁止路由切换界面
    $terminal.pause()
    
    /* 获取数据与异常处理 */
    
    // 恢复事件监听
    $terminal.resume()
  }
}
```

[ ☞ exmaples/conponent/sync](https://github.com/yeshimei/ntbl-ga/tree/dev/conponent/sync)

## 动画 

Ga 配合 [ntbl-log](https://github.com/yeshimei/ntbl-log)（或者其他类似的库）能够较为容易的实现两种动画。

- loading 动画
- 界面动画

或许，你有一些疑问？命令行是如何实现动画的？

得益于社区开发者们对命令行工具孜孜不倦的深掘，现成库比如 [log-update](https://github.com/sindresorhus/log-update#readme)，实现在命令行界面以稳定的帧率不断刷新同一行信息（实际上，是保留下其他行的信息，刷新整个命令行界面）。因此，我们有能力构建我们自己漂亮流畅的动画。

```js
// 安装 ntbl-log
npm i @ntbl/log --save
```

在 [exmaples/conponent/sync](https://github.com/yeshimei/ntbl-ga/tree/dev/conponent/sync) 实例中，我们使用 [ntbl-log](https://github.com/yeshimei/ntbl-log) 实现了一个 loading 加载动画。

```js
// views/home.js

// 引入 ntbl-log
const log = require('@ntbl/log')()

/* 一些代码 */

log.start(data => `${data.frame} 正在拉取用户数据，请稍等`)
```

当 loading 动画在不断刷新命令行界面时，无法将其他信息渲染到命令行界面上，所以，必须让它在合适的时机停止。

```js
// views/home.js

// 后续代码
const userList = await getUserData()
if (userList) {
  // 当获取到数据时，停止 loading 动画
  log.stop()
}
```

在 [exmaples/dome](https://github.com/yeshimei/ntbl-ga/tree/dev/exmaples/dome) 我们使用 [ntbl-log](https://github.com/yeshimei/ntbl-log) 实现了一个简洁的界面动画。

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200616231014.gif)


```js
// uitls/log.js

const log = require('@ntbl/log')()

/* 自定义动画相关数据 */

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

module.exports = log
```

然后，在组件中使用自定义动画。

```js
// views/home.js

const log = require('../utils/log')

// 使用 ntbl-log
log.home.logo(function (frame) {
  /* 一些模板格式处理 */
  const content = frame + '\n\n'
    + chalk.red.bold(`欢迎使用 ${package.name} `) + chalk.gray('v' + package.version) + '\n\n'
    + chalk.red(package.description)

    const box = boxen(content, {
      padding: { left: 5, right: 5, top: 2, bottom: 2},
      borderStyle: 'singleDouble',
      borderColor: 'gray',
      align: 'center'
    })
  
  // 加上顶部和底部信息
  const template = store.layout.header + box + store.layout.footer
  
  return template
})
```

在 `beforeEach` 事件（界面切换时）里关闭界面动画。 

```js
// router.js

const log = require('./utils/log')

module.exports = app => {
  const { $event } = app
  $event.on('beforeEach', function (to, from, next) {
    // 界面切换时，关闭 log 的动画
    log.stop()
    next()
  })
  
  /* 路由声明 */
}  
```


# Documentation

一份由 jsdoc 生成的 [**API Documentation**](https://yeshimei.github.io/ntbl-ga/)

# Issues
    
遇到任何问题，欢迎提交 [Issues](https://github.com/yeshimei/ntbl-ga/issues)

# License

The MIT License (MIT)

Copyright (c) 2014-2015 James Shore

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.