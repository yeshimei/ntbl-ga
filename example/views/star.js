
async function show (app) {
  const { inquirer, chalk, $terminal, st, store, utils, log } = app

  $terminal.clear()

  log.start(data => `${store.layout.header}${data.frame} 请稍等，正在拉取已关注仓库列表数据`)
  await utils.wait()
  log.stop()

  const stared = st.getStared()

  if (stared.length) {
    $terminal.clear().pause()

    const choices = stared.map(star => ({
      name: `${star.name} (${utils.joinToText(star.categories, 'name', '/')})`,
      value: star
    }))

    const answer = await inquirer.prompt([{
      type: "checkbox",
			message: "已关注仓库列表：",
      name: "stars",
      choices,
      validate: function(answer) {
        return answer.length < 1 
          ? "您必须至少选择一个。" 
          : true
			}
    }])
    
    $terminal.resume()
    
    store.stars = answer.stars

    return `您选择了以下已关注的仓库：\n\n` 
      + chalk.red(`${utils.joinToText(answer.stars, 'name')}\n\n`)
      + '然后？'
  }
}

async function addCategory (app) {
  const { inquirer, chalk, $terminal, st, store } = app
  const categories = st.getCategory()

  $terminal.clear().pause()

  const choices = categories.map(category => ({
    name: `${category.name} (${category.stars.length})`,
    value: category.name
  }))

  const answer = await inquirer.prompt([{
    type: "list",
    message: "请选择一个分类：",
    name: "name",
    choices,
    validate: function(answer) {
      return answer.length < 1 
        ? "您必须选择一个。" 
        : true
    }
  }])
  
  $terminal.resume()
  
  st.addStar(answer.name, store.stars)

  return chalk.green(`√ 已添加到分类`)
}

async function removeCategory (app) {
  const { chalk, st, store } = app
  st.delStar(store.stars)
  return chalk.green('√ 已移除分类')
}

async function unfollow (app) {

  const { chalk, st, store } = app

  st.unfollow(store.stars)

  return chalk.green('√ 已取消关注')
}


module.exports = {
  show,
  addCategory,
  removeCategory,
  unfollow
}
