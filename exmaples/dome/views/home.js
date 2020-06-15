const package = require('../package.json')
const boxen = require('boxen')

module.exports = async function (app) {
  const { chalk, log, store, $terminal} = app
  $terminal.clear()

  log.home.logo(function (frame) {
    const content = frame + '\n\n'
    + chalk.red.bold(`欢迎使用 ${package.name} `) + chalk.gray('v' + package.version) + '\n\n'
    + chalk.red(package.description)

    const box = boxen(content, {
      padding: { left: 5, right: 5, top: 2, bottom: 2},
      borderStyle: 'singleDouble',
      borderColor: 'gray',
      align: 'center'
    })
  
    const template = store.layout.header + box + store.layout.footer

    return template
  })
}