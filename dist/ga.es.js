// * Released under the MIT License.

import _ from 'lodash';
import cl from 'clear';
import cliCursor from 'cli-cursor';
import Term from 'tty-events';

/**
 * @name Event
 * @class
 */
class Event {
  constructor() {
    this._events = [];
  }
  /**
   * 订阅事件  
   * - mount 
   * - mounted
   * - beforeEach
   * - afterEach
   * @memberof Event
   * @instance
   * @param {String} name - 事件名
   * @param {Function} fn - 事件函数
   * @param {*} ctx - this 指向
   */


  on(name, fn, ctx) {
    const events = this._events;

    if (typeof fn === 'function' && !events.some(event => event.name == name && event.fn == fn)) {
      events.push({
        name,
        fn,
        ctx
      });
    }
  }

  async emit(name, ...args) {
    const events = this._events.filter(event => event.name === name);

    if (events.length) {
      if (name === 'beforeEach') {
        for (let event of events) {
          let next = false;
          await event.fn.call(event.ctx, ...args, function (path) {
            next = true;
            if (path) this.$router.push(path);
          }); // 当存在一个 beforeEach 事件内部未调用调用 next
          // 通知路由中断执行

          if (!next) return false;
        } // 所有的 beforeEach 事件内部都正确的调用了 next
        // 通知路由继续执行


        return true;
      }

      for (let event of events) {
        await event.fn.apply(event.ctx, args);
      }
    }
  }

}

/**
 * 全局配置对象
 * @name config
 * @memberof Ga
 * @static
 * @type {object}
 * @property {Number} [timeout=0] - 等待转义序列的响应时间
 * @property {Boolean} [test=false] - 测试模式
 */
var config = {
  test: false,
  // https://github.com/dd-pardal/tty-events#escape-key
  timeout: 0
};

function isAsyncFn(value) {
  return Object.prototype.toString.call(value) === '[object AsyncFunction]';
}
function isCommonFn(value) {
  return Object.prototype.toString.call(value) === '[object Function]';
}
function resetPath(path) {
  return path.split('/').map(key => key.split('+').sort((a, b) => b.length - a.length).join('+')).join('/');
}
function getRwaKey(path) {
  return _.last(path.split('/'));
}
function getKeys(path) {
  const ks = getRwaKey(path).split('+').map(k => k.toLocaleLowerCase());
  return {
    name: _.last(ks),
    ctrl: ks.includes('ctrl'),
    alt: ks.includes('alt'),
    shift: ks.includes('shift')
  };
}
function isCombinationKey(path) {
  return path.split('+').some(key => ['ctrl', 'shift', 'alt'].includes(key));
}
function combineComboKeys(key) {
  const {
    name,
    ctrl,
    alt,
    shift
  } = key;
  return resetPath(name + (ctrl ? '+ctrl' : '') + (alt ? '+alt' : '') + (shift ? '+shift' : ''));
}
function formatRoutes(routes) {
  return routes.map(route => {
    const {
      path,
      jump
    } = route;

    if (path) {
      if (typeof path === 'string') route.path = [path];
      route.path = route.path.map(p => ({
        path: resetPath(p),
        key: getRwaKey(p),
        keys: getKeys(p)
      }));
    } else {
      throw new TypeError(`Specify at least one legal path for the ${route.name} route`);
    }

    if (jump) {
      if (typeof jump === 'string') route.jump = [jump];

      if (!route.jump.every(p => isCombinationKey(p))) {
        throw new TypeError(`The jump option of the ${route.name} route must be a key combination (ctrl/alt/shift)`);
      }

      route.jump = route.jump.map(p => ({
        path: resetPath(p),
        keys: getKeys(p)
      }));
    }

    return route;
  });
}

let history = [];
let historyIndex = 0;
function initRouter(app) {
  const router = app._options.router;

  if (typeof router !== 'function') {
    throw new TypeError('Router must be a function');
  }
  /**
   * @name Router
   * @class
   */

  /**
   * 路由
   * @name $router
   * @memberof Ga
   * @instance
   * @type {Router}
  */


  app.$router = {
    push: push.bind(app),
    go: go.bind(app),
    back: back.bind(app),
    forward: forward.bind(app),
    routes: formatRoutes(router(app).routes)
  };
  /**
   * 当前路由对象
   * @name $route
   * @memberof Ga
   * @instance
   * @property {String} [key=null] - 当前路由的触发按键
   * @property {Object} [keys={}]  - 当前路由的触发按键对象
   * @property {String} [keys.name=null] - 触发按键的名称
   * @property {Boolean} [keys.ctrl=false] - 触发按键是否包含了 Ctrl 按键
   * @property {Boolean} [keys.alt=false] - 触发按键是否包含了 Alt 按键
   * @property {Boolean} [keys.shift=false] - 触发按键是否包含了 Shift 按键
   * @property {String} [path='/'] - 当前路由的路径
   * @property {Object} [route={}] - 当前路由对象（路由列表中匹配当前路径的对象）
   */

  app.$route = {
    key: null,
    keys: {},
    path: '/',
    route: {},
    children: [],
    chain: []
  };
}
function routerMixin(Ga) {
  Ga.prototype.$mount = mount;
  Ga.prototype.$render = render;
}
/**
  * 挂载路由
  * @memberof Ga
  * @instance
  */

async function mount() {
  // mount 事件
  // 此时，路由未挂载，页面未渲染
  await this.$event.emit('mount'); // 监听键盘事件（挂载路由）

  this.$terminal.resume();
  this.$terminal.on('keypress', async (key = {}) => {
    let {
      name,
      ctrl
    } = key;
    const {
      $router,
      $route
    } = this;
    const {
      routes
    } = $router; // 强制退出

    if (ctrl && name === 'c') {
      process.exit(1);
    } // ESC 返回


    if (name === 'escape') {
      return await $router.back();
    } // path 转跳


    key = combineComboKeys(key);
    const path = `${$route.path}/${key}`.replace('//', '/');

    if (routes.some(route => route.path.some(p => p.path === path))) {
      return await $router.push(path);
    } // jump 转跳


    const route = routes.find(route => route.jump && route.jump.find(p => p.path === key));

    if (route) {
      return await $router.push(route.path[0].path);
    }
  }); // 渲染页面

  await this.$router.push(this.$route.path); // mounted 事件
  // 此时，路由已挂载，页面已渲染完成  

  await this.$event.emit('mounted');
}
/**
  * 渲染页面
  * @memberof Ga
  * @instance
  */


async function render() {
  const {
    oldRoute,
    route
  } = this.$route;
  const next = await this.$event.emit('beforeEach', this.$route, oldRoute);
  if (next === false) return;
  let component = route.component; // 当组件为字符串或普通函数时，封装为 async

  if (typeof component === 'string') {
    component = async () => component;
  } else if (typeof isCommonFn(component)) {
    const fn = component;

    component = async ctx => fn(ctx);
  }

  if (isAsyncFn(component)) {
    component(this).then(async template => {
      // 设置当前模板
      this.$route.template = template; // 当组件未返回模板时，将由控制器交给用户

      if (template && typeof template === 'string') {
        // 清理屏幕
        this.$terminal.clear(); // 打印

        this.$event.emit('render', this.$route);

        if (!this.constructor.config.test) {
          console.log(this.$route.template);
        }
      } // 后置钩子


      await this.$event.emit('afterEach', this.$route, oldRoute);
    });
  }
}
/**
 * 转跳至指定路径或名字的页面
 * 
 * @memberof Router
 * @instance
 * @param {String} path - 路径或名字
 * @param {Number} n - 当存在多个路径时，指定名字，可选择第几个路径
 */


async function push(path, n = 0) {
  const {
    $route,
    $router
  } = this;
  const {
    routes
  } = $router; // 支持 name

  if (path[0] !== '/') {
    const route = routes.find(route => route.name === path);
    path = route && route.path[n].path;
  }

  if (!path) return;
  let paths;
  let route = routes.find(route => paths = route.path.find(p => p.path === path));
  if (!route) return;
  $route._oldRoute = $route;
  $route.key = paths.key;
  $route.keys = paths.keys;
  $route.path = path;
  $route.route = route;
  await this.$render(); // history 

  if (path !== history[historyIndex]) {
    history = _.take(history, historyIndex + 1);
    history.push(path);
    historyIndex = history.length - 1;
  }
}
/**
 * 返回一个页面
 * 
 * @memberof Router
 * @instance
 */


async function back() {
  await this.$router.go(-1);
}
/**
 * 向前一个页面
 * 
 * @memberof Router
 * @instance
 */


async function forward() {
  await this.$router.go(1);
}
/**
 * 转跳 n 个页面，n 为正数向前，负数向后
 * 
 * @memberof Router
 * @instance
 */


async function go(n) {
  let index = historyIndex + n;
  if (index < 0) index = 0;
  if (index > history.length) index = history.length;
  historyIndex = index;
  await this.$router.push(history[index]);
}

/**
 * @name Terminal
 * @class
 */

class Terminal {
  constructor(options) {
    this.term = new Term();
    this._options = options;
    this.term.timeout = options.timeout;
  }
  /**
   * 清除屏幕
   * @memberof Terminal
   * @instance
   */


  clear() {
    if (!this._options.test) cl();
  }

  on(event, fn) {
    this.term.on(event, fn);
  }
  /**
   * 暂停终端监听
   * @memberof Terminal
   * @instance
   */


  pause() {
    cliCursor.show();
    this.term.pause();
  }
  /**
   * 恢复终端监听
   * @memberof Terminal
   * @instance
   */


  resume() {
    cliCursor.hide();
    this.term.resume();
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
  }

}

function initTerminal(app) {
  /**
   * 终端
   * @name $terminal
   * @instance
   * @memberof Ga
   * @type {Terminal}
   */
  app.$terminal = new Terminal(app.constructor.config);
}

let uid = 0;
function initMixin(Ga) {
  Ga.config = config;

  Ga.prototype._init = function (options) {
    const app = this;
    app._uid = uid++;
    app._options = options;
    app._version = "1.0.1";
    /**
     * 公共存储对象，跨组件间共享数据
     * @name store
     * @memberof Ga
     * @type {Object}
     * @default {}
     * @instance
     */
    // 公共存储

    app.store = {};
    /**
     * 事件
     * @name $event
     * @memberof Ga
     * @instance
     * @type {Event}
    */

    app.$event = new Event(); // 初始化终端

    initTerminal(app); // 初始化路由

    initRouter(app); // 插件

    options.plugins = Array.isArray(options.plugins) ? options.plugins : [];
    options.plugins.forEach(plugin => plugin(app));
  };
}

/**
 * 一个构建交互式命令行界面应用的库
 * @name Ga
 * @class
 * @author hsy <hsy.ntbl@gmail.com>
 * @param {Object} options - 选项对象
 * @param {Function} options.router - 路由
 * @param {Array} options.plugins - 插件 
 * @returns {app}
 */

function Ga(options) {
  if (!(this instanceof Ga)) new Ga(options);

  this._init(options);
}
initMixin(Ga);
routerMixin(Ga);

export default Ga;
