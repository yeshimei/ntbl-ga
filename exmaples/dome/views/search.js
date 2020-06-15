const fuzzy = require('fuzzy')

async function show (app) {
  const { inquirer, chalk, $terminal, st, store, utils } = app
  const searchList = st.getSearchList()

  if (searchList.length) {
    $terminal.clear()
    $terminal.pause()

    async function search (name = ' ') {
      return fuzzy.filter(name, searchList, {
        extract: el => el.name
      })
      .map(el => ({
        name: el.string,
        value: el.original
      }))
    }

    const answer = await inquirer.prompt([{
      type: "autocomplete",
			message: "搜索栏（请输入仓库名）：",
      name: "repertory",
      source: async function(answersSoFar, input) {
        return await search(input);
      },
      validate: function(answer) {
        return answer.length < 1 
          ? "您必须至少选择一个。" 
          : true
			}
    }])
    
    $terminal.resume(app)
    
    store.repertory = answer.repertory

    return `您选择了以下的仓库：\n\n` 
      + chalk.red(`${answer.repertory.name}\n\n`)
      + '然后？'
  }
}

async function addCategoryAndFollow (app) {
  const { inquirer, chalk, $terminal, st, store } = app
  const categories = st.getCategory()

  $terminal.clear()
  $terminal.pause()

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
  
  st.addStar(answer.name, [store.repertory] )
  st.follow([store.repertory])

  return chalk.green('√ 已添加至分类且关注')
}

module.exports = {
  show,
  addCategoryAndFollow
}
