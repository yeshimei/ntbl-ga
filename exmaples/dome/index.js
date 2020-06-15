const Ga = require('../../dist/ga.cjs')
const router = require('./router')
const inquirer = require('inquirer')
const store = require('./utils/store')
const log = require('./utils/log')
const utils = require('./utils/utils')
const chalk = require('chalk')
const gaPluginTwo = require('./plugin/gaPluginTwo')
const package = require('./package.json')

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
inquirer.registerPrompt('search-checkbox', require('inquirer-search-checkbox'))

Ga.prototype.utils = utils
Ga.prototype.inquirer = inquirer
Ga.prototype.st = store
Ga.prototype.log = log
Ga.prototype.chalk = chalk


// Ga.config.test = true
  
const ga = new Ga({
  router,
  plugins: [ gaPluginTwo(package) ]
})

ga.$mount()
