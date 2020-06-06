const Github = require('github-api')
const extend = require('lodash/extend')
const pick = require('lodash/pick')
const find = require('lodash/find')
const store = require('./store')


class Api {
  constructor (options) {
    extend(this, {
      gh: null,
      user: null,
    }, options)
  }

  async login () {
    this.gh = new Github({
      username: store.get('login.username'),
      password: store.get('login.password'), 
      auth: 'basic'
    });
    
    this.user = this.gh.getUser()
    await this.user.getEmails()
  }

  async getStaredList () {
    const { data } = await this.user.listStarredRepos()
    const stars = store.get('stars')
    return data.map(star => {
      const local = stars.find(localStar => localStar.id === star.id)
      star.category = local && local.category
      return pick(star, ['id', 'name', 'full_name', 'url', 'stargazers_count', 'category'])
    })
  }

  async search (q) {
    const sh = this.gh.search({
      q,
      sort: 'stars',
      order: 'desc',
      type: 'all',
      per_page: 5,
      page: 1,
    })

    const { data } = await sh.forRepositories()
    return data.map(repository => pick(repository, ['id', 'name', 'full_name', 'url' , 'stargazers_count']))
  }
}

const api = new Api();


// (async function () {
//   await api.login();
//   console.log(await api.getStaredList());
//   // console.log(await api.search('git'));
// }())


module.exports = api
