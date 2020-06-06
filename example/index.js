const Ga = require('../src/index')
const router = require('./router')
const api = require('./utils/github-api')
const inquirer = require('inquirer')
const store = require('./utils/store')
const log = require('./utils/log')
const utils = require('./utils/utils')
const chalk = require('chalk')
const gaPluginTwo = require('./plugin/gaPluginTwo')
const package = require('./package.json')

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
inquirer.registerPrompt('search-checkbox', require('inquirer-search-checkbox'))

Ga.use(gaPluginTwo(package))

Ga.prototype.utils = utils
Ga.prototype.api = api
Ga.prototype.inquirer = inquirer
Ga.prototype.st = store
Ga.prototype.log = log
Ga.prototype.chalk = chalk


// Ga.config.clear = false

const ga = new Ga({
  router
})
