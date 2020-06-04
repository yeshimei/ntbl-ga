import supertest from 'supertest'
import app from './server/server'

const baseUrl = '/test'

const request = supertest.agent(app.callback())
export let get = http('get')
export let post = http('post')


function http(method) {
  return async function (url, data) {
    return await request[method](baseUrl + url)[method === 'get' ? 'query' : 'send'](data).expect(200)
  }
}