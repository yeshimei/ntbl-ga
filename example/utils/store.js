const fs = require('fs')
const Conf = require('conf')
const mock = require('mockjs')
const _ = require('lodash')
const store = new Conf()

// store.clear()

// new Conf({
//   defaults: getStore().data
// })



function getCategory () {
  return store
    .get('categories')
    .map(category => {
      category.star_count = category.stars.length
      return category
    })
}

function setCategory (data) {
  store.set('categories', data)
}

function addCategory (name) {
  const categories = getCategory()
  categories.push({
    id: _uniqueId(),
    name,
    stars: []
  })
  setCategory(categories)
}

function delCategory (name) {
  const categories = getCategory()
  _.pullAllBy(categories, { name }, 'name')
  setCategory(categories)
}

function setCategoryName (name, newName) {
  const categories = getCategory()
  const category = categories.find(category => category.name === name)
  if (category) {
    category.name = newName
    setCategory(categories)
  }
}

function addStar (name, star) {
  const categories = getCategory()
  const category = categories.find(category => category.name === name)
  if (category) {
    category.stars.push(...star)
    category.stars = _.uniqBy(category.stars, 'id')
    setCategory(categories)
  }
}

function delStar (stars) {
  const categories = getCategory()
  stars.forEach(star => {
    categories.forEach(category => {
      category.stars = category.stars.filter(st => st.id !== star.id)
    })
  })

  setCategory(categories)
}

function getStared () {
  const categories = getCategory()
  return store
    .get('stared')
    .map(star => {
      star.categories = categories
        .filter(category => category.stars.find(cStar => cStar.id === star.id))
        .map(category => _.pick(category, ['id', 'name']))
      return star  
    })
}

function follow (repertories) {
  const stared = store.get('stared')
  stared.push(...repertories)
  store.set('stared', stared)
}

function unfollow (stars) {
  const stared = store.get('stared')
  _.pullAllBy(stared, stars, 'id')
  store.set('stared', stared)
}


function getSearchList () {
  return store.get('search')
}

function getStore () {
  return mock.mock({
    data: {
      login: {
        username: 'hsy.ntbl@gmail.com',
        password: 'songyang10GH11'
      },
      'categories|5-10': [
        {
          id: '@guid',
          name: '@cname',
          'stars|0-30': [{
            name: '@name',
            full_name: 'full-@name',
            url: '@url',
            language: '@pick(js, html, css)',
            stargazers_count: '@integer(1, 10000)'
          }],
        }
      ],
      'stared|10-100': [{
        id: '@guid',
        name: '@name',
        full_name: 'full-@name',
        url: '@url',
        language: '@pick(js, html, css)',
        stargazers_count: '@integer(1, 10000)'
      }],
      'search|100': [{
        id: '@guid',
        name: '@name',
        full_name: 'full-@name',
        url: '@url',
        language: '@pick(js, html, css)',
        stargazers_count: '@integer(1, 10000)'
      }],
    }
  })
}




module.exports = {
  addCategory,
  addStar,
  delCategory,
  delStar,
  getCategory,
  getStared,
  setCategory,
  setCategoryName,
  follow,
  unfollow,
  getSearchList
}
