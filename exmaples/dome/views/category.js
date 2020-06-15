
async function show () {
  
  return '分类'
}

async function create () {

  return '分类-创建'
}

async function del () {

  return '分类-删除'
}

async function setName () {

  return '分类-更改名字'
}

async function moveStar () {

  return '分类-移动关注'
}

async function removeStar () {

  return '分类-移除关注'
}


module.exports = {
  show,
  create,
  del,
  setName,
  moveStar,
  removeStar
}
