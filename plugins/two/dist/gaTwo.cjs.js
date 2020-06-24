// * Released under the MIT License.

'use strict';

const chalk = require('chalk');

function two(options) {
  return function (app) {
    const {
      store,
      $router
    } = app;
    store.layout = {};
    app.$event.on('beforeEach', function (to, form, next) {
      const chain = getChain($router.routes, to.path);
      const children = getChildren($router.routes, to.path); // 添加顶部仓库名和面包屑导航

      const name = `● ${options.name || 'Ga'} `;
      const breadcrumb = chain.map(route => route.alias).join('/');
      store.layout.header = chalk.red(name + breadcrumb) + '\n\n'; // 添加尾部菜单栏

      const menu = children.map(route => `${route.alias}[${route.path.map(path => path.key).join('/')}]`);
      chain.length > 1 && menu.push('返回[ESC]');
      const jumpMenu = app.$router.routes.filter(route => Array.isArray(route.jump)).map(route => `${route.alias}(${route.jump.map(el => el.path).join('/')})`);
      store.layout.footer = chalk.gray(`\n\n${menu.join(' | ')}\n\n${jumpMenu.join(' | ')}`);
      next();
    });
    app.$event.on('render', function (route) {
      route.template = store.layout.header + route.template + store.layout.footer;
    });
  };
}

function getChain(routes, path) {
  const chain = []; // 根路径的特殊处理

  const keys = path === '/' ? ['/'] : path.split('/');
  keys.forEach((key, index) => {
    const othPath = keys.slice(0, index + 1).join('/') || '/';
    const route = routes.find(route => route.path.find(p => p.path === othPath));
    if (route) chain.push(route);
  });
  return chain;
}

function getChildren(routes, path) {
  const children = routes.filter(route => {
    route.path = route.path.filter(p => RegExp(`^\\${path}\\/?[^\\/]*$`).test(p.path));
    return route.path.length;
  });
  return children.slice(1);
}

module.exports = two;
