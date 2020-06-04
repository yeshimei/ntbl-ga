// * Released under the MIT License.

'use strict';

const initGlobal = require('./init');

const initRouter = require('./router');

const initTemplate = require('./template');
/**
 *
 * {
 *   router
 * }
 *
 *
 *
 * @param options
 * @constructor
 */


function Ga(options) {
  if (!(this instanceof Ga)) new Ga(options);
  this.$init(options);
}

initGlobal(Ga);
initTemplate(Ga);
initRouter(Ga);
module.exports = Ga;
