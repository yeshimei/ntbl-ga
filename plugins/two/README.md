# ga-two

[![GitHub](https://img.shields.io/badge/GitHub-yeshimei-green.svg)](https://github.com/yeshimei/ntbl-ga/tree/dev/plugins/two) [![npm](https://img.shields.io/npm/v/@ntbl/ga-two.svg)](https://www.npmjs.com/package/@ntbl/ga-two) [![MIT](https://img.shields.io/npm/l/express.svg)](https://github.com/yeshimei/ntbl-ga/tree/dev/plugins/two)


[@ntbl/ga](https://github.com/yeshimei/ntbl-ga) 插件，生成漂亮的顶底部模板。


- [Installation](#Installation)
- [Usage](#Usage)
- [Options](#Options)
- [Store](#Store)



![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200624212108.png)

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200624212200.png)


目前，包括：

- logo
- 面包屑导航
- 菜单

# Installation

```bash
npm i @ntbl/ga-two --save
```

# Usage


```js
const Ga = require('@ntbl/ga')
const Ga = require('@ntbl/ga-two')
const router = require('./router')
const options = require('./package.json')

const app = new Ga({
  router,
  plugins: [ two(options) ]
})

app.$mount()
```

在路由（router）声明。

```js
{
  path: '/',
  name: 'home',
  // 必须指定这个字段
  // 提示菜单的显示名
  alias: '首页',
  component: home
}
```

底部菜单会正确的显示 `返回（ESC）` 提示。

# Options

- name - 项目名

# Store

two 存储在 app.store 对象上的全局数据：
- `app.store.layout.header` 顶部模板
- `app.store.layout.footer` 底部模板
