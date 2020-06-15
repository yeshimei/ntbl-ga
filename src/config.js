
/**
 * 全局配置对象
 * @name config
 * @memberof Ga
 * @static
 * @type {object}
 * @property {Number} [timeout=0] - 等待转义序列的响应时间
 * @property {Boolean} [test=false] - 测试模式
 */
export default {
  test: false,
  // https://github.com/dd-pardal/tty-events#escape-key
  timeout: 0
}