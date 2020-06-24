# ga-two

[![GitHub](https://img.shields.io/badge/GitHub-yeshimei-green.svg)](https://github.com/yeshimei/ntbl-ga.git) [![npm](https://img.shields.io/npm/v/@ntbl/ga.svg)](https://www.npmjs.com/package/@ntbl/ga) [![MIT](https://img.shields.io/npm/l/express.svg)](https://github.com/yeshimei/ntbl-ga.git)

- [Installation](#Installation)
- [Usage](#Usage)

@ntbl/ga 插件，生成漂亮的顶底部吗模板。
- logo
- 面包屑导航
- 菜单





![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200624212108.png)

![](https://yeshimei.oss-cn-beijing.aliyuncs.com/20200624212200.png)


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

# Options

- name - 项目名

# Store

two 存储在 app.store 对象上的全局数据：
- `app.store.layout.header` 顶部模板
- `app.store.layout.footer` 底部模板
